interface AddColumnButtonProps {
  onClick: () => void
}

export function AddColumnButton({ onClick }: AddColumnButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-[220px] shrink-0 items-center gap-2 self-start rounded-2xl border border-dashed border-stone bg-paper/80 px-4 text-sm text-ink/70 transition hover:border-mustard hover:bg-mist hover:text-navy"
    >
      <span className="text-lg leading-none text-mustard">+</span> adicionar coluna
    </button>
  )
}
