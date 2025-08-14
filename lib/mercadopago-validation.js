import crypto from 'crypto';
/**
 * Validates an incoming webhook request from MercadoPago.
 * @param req The NextRequest object.
 * @param body The raw request body as a string.
 * @returns True if the signature is valid, false otherwise.
 */
export function isValidMercadoPagoRequest(req, body) {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    const signature = req.headers.get('x-signature');
    if (!secret || !signature) {
        console.error('Webhook secret or signature is missing.');
        return false;
    }
    // The signature header is a comma-separated list of key-value pairs.
    // Example: ts=1612345678,v1=...
    const parts = signature.split(',');
    const signatureData = {};
    parts.forEach((part) => {
        const [key, value] = part.split('=');
        signatureData[key] = value;
    });
    const timestamp = signatureData['ts'];
    const receivedHash = signatureData['v1'];
    if (!timestamp || !receivedHash) {
        console.error('Timestamp or hash is missing from the signature header.');
        return false;
    }
    // Prevent replay attacks by checking if the timestamp is too old
    const fiveMinutesInMillis = 5 * 60 * 1000;
    const requestTimestamp = parseInt(timestamp, 10) * 1000; // MP sends it in seconds
    const now = Date.now();
    if (now - requestTimestamp > fiveMinutesInMillis) {
        console.error('Webhook timestamp is too old. Possible replay attack.');
        return false;
    }
    // Create the signed payload string
    const signedPayload = `ts:${timestamp}.${body}`;
    // Create the HMAC
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const calculatedHash = hmac.digest('hex');
    // Compare the calculated hash with the one from the header
    return crypto.timingSafeEqual(Buffer.from(calculatedHash, 'hex'), Buffer.from(receivedHash, 'hex'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyY2Fkb3BhZ28tdmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lcmNhZG9wYWdvLXZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRTVCOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QixDQUFDLEdBQWdCLEVBQUUsSUFBWTtJQUN0RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDO0lBQ3RELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRWpELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFDekQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLGdDQUFnQztJQUNoQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sYUFBYSxHQUE4QixFQUFFLENBQUM7SUFDcEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1FBQzdCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzdCLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV6QyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELGlFQUFpRTtJQUNqRSxNQUFNLG1CQUFtQixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0lBQzFDLE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyx5QkFBeUI7SUFDbEYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRXZCLElBQUksR0FBRyxHQUFHLGdCQUFnQixHQUFHLG1CQUFtQixFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG1DQUFtQztJQUNuQyxNQUFNLGFBQWEsR0FBRyxNQUFNLFNBQVMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUVoRCxrQkFBa0I7SUFDbEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTFDLDJEQUEyRDtJQUMzRCxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxFQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FDakMsQ0FBQztBQUNKLENBQUMifQ==