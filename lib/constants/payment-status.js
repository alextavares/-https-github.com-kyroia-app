export const PaymentStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
};
// Helper functions for status validation and conversion
export function isValidPaymentStatus(status) {
    return Object.values(PaymentStatus).includes(status);
}
export function normalizePaymentStatus(status) {
    const normalized = status.toLowerCase();
    switch (normalized) {
        case 'paid':
        case 'approved':
        case 'completed':
            return PaymentStatus.COMPLETED;
        case 'failed':
        case 'rejected':
        case 'refunded':
            return PaymentStatus.FAILED;
        case 'pending':
            return PaymentStatus.PENDING;
        default:
            throw new Error(`Unknown payment status: ${status}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudC1zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXltZW50LXN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUc7SUFDM0IsT0FBTyxFQUFFLFNBQVM7SUFDbEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsTUFBTSxFQUFFLFFBQVE7Q0FDUixDQUFBO0FBSVYsd0RBQXdEO0FBQ3hELE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxNQUFjO0lBQ2pELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBMkIsQ0FBQyxDQUFBO0FBQzNFLENBQUM7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsTUFBYztJQUNuRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7SUFFdkMsUUFBUSxVQUFVLEVBQUUsQ0FBQztRQUNuQixLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssV0FBVztZQUNkLE9BQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQTtRQUNoQyxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssVUFBVSxDQUFDO1FBQ2hCLEtBQUssVUFBVTtZQUNiLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQTtRQUM3QixLQUFLLFNBQVM7WUFDWixPQUFPLGFBQWEsQ0FBQyxPQUFPLENBQUE7UUFDOUI7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELENBQUM7QUFDSCxDQUFDIn0=