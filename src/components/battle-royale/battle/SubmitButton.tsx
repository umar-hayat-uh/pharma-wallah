export function SubmitButton({ disabled, onClick, label = "Submit" }: { disabled: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 min-w-[9rem] items-center justify-center rounded-xl bg-[#1C7BD9] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(28,123,217,.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:bg-[#16181d]/15 disabled:text-[#16181d]/45 disabled:shadow-none"
    >
      {label}
    </button>
  );
}
