export interface RolePermission {
  id: number,
  role: 'admin' | 'moderator',
  permission: 'channels.delete' | 'messages.delete',
}
