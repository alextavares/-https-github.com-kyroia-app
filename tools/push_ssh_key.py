import argparse
import os
import sys

import paramiko


def ensure_remote_dir_and_file(ssh: paramiko.SSHClient, path: str) -> None:
    dirpath = os.path.dirname(path)
    ssh.exec_command(f"mkdir -p {dirpath} && chmod 700 {dirpath} && touch {path} && chmod 600 {path}")


def read_local_pubkey(pubkey_path: str) -> str:
    with open(os.path.expanduser(pubkey_path), "r", encoding="utf-8") as f:
        return f.read().strip()


def key_present(sftp: paramiko.SFTPClient, auth_keys_path: str, pubkey: str) -> bool:
    try:
        with sftp.open(auth_keys_path, "r") as f:
            content = f.read().decode("utf-8", errors="ignore")
        return pubkey in content
    except FileNotFoundError:
        return False


def append_key(sftp: paramiko.SFTPClient, auth_keys_path: str, pubkey: str) -> None:
    with sftp.open(auth_keys_path, "a") as f:
        if not pubkey.endswith("\n"):
            pubkey += "\n"
        f.write(pubkey)


def main() -> int:
    parser = argparse.ArgumentParser(description="Push local SSH public key to remote authorized_keys")
    parser.add_argument("--host", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--pubkey", default="~/.ssh/id_ed25519.pub")
    parser.add_argument("--auth-keys", default="~/.ssh/authorized_keys")
    args = parser.parse_args()

    pubkey = read_local_pubkey(args.pubkey)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(
            hostname=args.host,
            username=args.user,
            password=args.password,
            timeout=15,
            banner_timeout=15,
            auth_timeout=15,
            look_for_keys=False,
            allow_agent=False,
        )
    except Exception as e:
        print(f"ERROR: SSH connect failed: {e}")
        return 2

    try:
        # Normalize remote path for root
        auth_keys_path = args.auth_keys.replace("~", f"/root") if args.user == "root" else args.auth_keys
        ensure_remote_dir_and_file(ssh, auth_keys_path)
        sftp = ssh.open_sftp()
        if key_present(sftp, auth_keys_path, pubkey):
            print("Public key already present on remote.")
        else:
            append_key(sftp, auth_keys_path, pubkey)
            print("Public key appended to authorized_keys.")
        sftp.chmod(auth_keys_path, 0o600)
        sftp.close()

        stdin, stdout, stderr = ssh.exec_command("whoami && uname -a")
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        if out:
            print("Remote check:\n" + out)
        if err:
            print("Remote stderr:\n" + err)
    finally:
        ssh.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

