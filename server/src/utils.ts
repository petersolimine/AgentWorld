export function formatActionsToString(
  actionsArray: Array<{ user: string; action: any }>
): string {
  return actionsArray.map((item) => `${item.user}: ${item.action}`).join("\n");
}
