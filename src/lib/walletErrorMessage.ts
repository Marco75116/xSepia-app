export function walletErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "shortMessage" in err &&
    typeof (err as { shortMessage: unknown }).shortMessage === "string"
  ) {
    return (err as { shortMessage: string }).shortMessage;
  }
  if (err instanceof Error) {
    return err.message.split("\n")[0];
  }
  return "Could not switch network";
}
