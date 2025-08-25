import { getServerSession as gss } from 'next-auth'
export { authOptions } from './nextauth-options'
export const getServerSession = gss
export default { getServerSession: gss, authOptions }
