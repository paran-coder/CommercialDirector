export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function executionLabel(value: string) {
  const labels: Record<string, string> = {
    narrative: "내러티브",
    product_spectacle: "제품 스펙터클",
    character: "캐릭터",
    sensory: "감각 중심",
    social: "소셜",
  };
  return labels[value] ?? value.replace(/_/g, " ");
}
