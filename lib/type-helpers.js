/**
 * Type helper utilities
 */
// Safe type assertion for API responses
export function assertType(value) {
    return value;
}
// Safe JSON parsing with type assertion
export function parseJsonAs(json) {
    return JSON.parse(json);
}
// Environment variable helper with defaults
export function getEnvVar(key, defaultValue) {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Environment variable ${key} is required`);
    }
    return value || defaultValue;
}
export default { assertType, parseJsonAs, getEnvVar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHlwZS1oZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOztHQUVHO0FBRUgsd0NBQXdDO0FBQ3hDLE1BQU0sVUFBVSxVQUFVLENBQUksS0FBVTtJQUN0QyxPQUFPLEtBQVUsQ0FBQztBQUNwQixDQUFDO0FBRUQsd0NBQXdDO0FBQ3hDLE1BQU0sVUFBVSxXQUFXLENBQUksSUFBWTtJQUN6QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFNLENBQUM7QUFDL0IsQ0FBQztBQUVELDRDQUE0QztBQUM1QyxNQUFNLFVBQVUsU0FBUyxDQUFDLEdBQVcsRUFBRSxZQUFxQjtJQUMxRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixHQUFHLGNBQWMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCxPQUFPLEtBQUssSUFBSSxZQUFhLENBQUM7QUFDaEMsQ0FBQztBQUVELGVBQWUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDIn0=