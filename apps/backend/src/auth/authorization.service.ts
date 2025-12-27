export class AuthorizationService {
    hasPermission(userPermissions: string[], requiredPermission: string): boolean {
        return userPermissions.includes(requiredPermission);
    }
}
