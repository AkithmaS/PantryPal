import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

function formatAmount(quantity, unit) {
  return `${quantity ?? ''} ${unit ?? ''}`.trim();
}

export default function ConflictResolutionModal({ isOpen, conflicts, cleanItems, onConfirm, onClose }) {
  const [decisions, setDecisions] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initial = {};

    cleanItems.forEach((item) => {
      initial[item.id] = {
        newExpiry: item.newExpiry ?? null,
      };
    });

    conflicts.forEach((conflict) => {
      initial[conflict.shoppingItem.id] = {
        action: 'merge',
        newExpiry: conflict.newExpiry ?? null,
        mergeQuantity: conflict.mergeQuantity ?? conflict.shoppingItem.quantity,
        mergeExpiry: conflict.mergeExpiry ?? conflict.existingPantryItem.expiryDate ?? null,
      };
    });

    setDecisions(initial);
  }, [cleanItems, conflicts, isOpen]);

  if (!isOpen) {
    return null;
  }

  const setDecision = (shoppingItemId, nextDecision) => {
    setDecisions((current) => ({
      ...current,
      [shoppingItemId]: {
        ...(current[shoppingItemId] || {}),
        ...nextDecision,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#111111]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close conflict resolution dialog"
      />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#ead9c7] bg-[#fffaf4] shadow-[0_30px_80px_rgba(17,17,17,0.22)]">
        <div className="flex items-start justify-between border-b border-[#ead9c7] px-6 py-5 sm:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#111111] sm:text-3xl">
              Adding {conflicts.length + cleanItems.length} items to pantry
            </h2>
            <p className="mt-1 text-sm text-[#6e6258]">
              {conflicts.length > 0
                ? 'Set expiry dates and resolve conflicts before confirming'
                : 'Set expiry dates for your new pantry items'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#8f6a4b] transition hover:bg-[#fff1e5] hover:text-[#111111]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-4">
            {cleanItems.map((item) => {
              const decision = decisions[item.id] || { newExpiry: null };

              return (
                <div key={item.id} className="rounded-[24px] border border-[#ead9c7] bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.05)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#111111]">{item.name}</h3>
                      <p className="mt-1 text-sm text-[#6e6258]">New item — not in pantry yet</p>
                      <p className="mt-3 text-sm font-medium text-[#111111]">{formatAmount(item.quantity, item.unit)}</p>
                    </div>
                  </div>

                  <div className="my-4 border-t border-[#ead9c7]" />

                  <label className="block max-w-xs">
                    <span className="mb-2 block text-sm font-medium text-[#4c4038]">Expiry date (optional)</span>
                    <input
                      type="date"
                      value={decision.newExpiry || ''}
                      onChange={(event) =>
                        setDecision(item.id, {
                          newExpiry: event.target.value || null,
                        })
                      }
                      className="h-11 w-full rounded-2xl border border-[#ead9c7] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                    />
                  </label>
                </div>
              );
            })}

            {conflicts.map((conflict) => {
              const decision = decisions[conflict.shoppingItem.id] || {
                action: 'merge',
                newExpiry: null,
                mergeQuantity: conflict.shoppingItem.quantity,
                mergeExpiry: conflict.existingPantryItem.expiryDate ?? null,
              };

              return (
                <div key={conflict.shoppingItem.id} className="rounded-[24px] border border-[#ead9c7] bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.05)]">
                  <h3 className="text-lg font-semibold text-[#111111]">{conflict.shoppingItem.name}</h3>

                  <div className="mt-4 rounded-2xl bg-[#fff4ea] p-4">
                    <p className="text-sm font-medium text-[#111111]">
                      In pantry: {formatAmount(conflict.existingPantryItem.quantity, conflict.existingPantryItem.unit)}
                      {' '}
                      · {conflict.existingPantryItem.expiryDate ? `Expires ${conflict.existingPantryItem.expiryDate}` : 'No expiry'}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#111111]">
                      Adding: {formatAmount(conflict.shoppingItem.quantity, conflict.shoppingItem.unit)}
                    </p>
                  </div>

                  <div className="my-4 border-t border-[#ead9c7]" />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setDecision(conflict.shoppingItem.id, {
                          action: 'new',
                          newExpiry: decision.newExpiry ?? null,
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        decision.action === 'new'
                          ? 'border-[#ff7a18] bg-[#ff7a18] text-[#111111]'
                          : 'border-[#ff7a18] bg-white text-[#111111] hover:bg-[#fff4ea]'
                      }`}
                    >
                      Add as New Item
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDecision(conflict.shoppingItem.id, {
                          action: 'merge',
                          mergeQuantity: decision.mergeQuantity ?? conflict.shoppingItem.quantity,
                          mergeExpiry: decision.mergeExpiry ?? conflict.existingPantryItem.expiryDate ?? null,
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        decision.action === 'merge'
                          ? 'border-[#ff7a18] bg-[#ff7a18] text-[#111111]'
                          : 'border-[#ff7a18] bg-white text-[#111111] hover:bg-[#fff4ea]'
                      }`}
                    >
                      Merge
                    </button>
                  </div>

                  {decision.action === 'merge' ? (
                    <div className="mt-4 space-y-4">
                      <label className="block max-w-xs">
                        <span className="mb-2 block text-sm font-medium text-[#4c4038]">Quantity to add</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={decision.mergeQuantity ?? conflict.shoppingItem.quantity}
                          onChange={(event) =>
                            setDecision(conflict.shoppingItem.id, {
                              action: 'merge',
                              mergeQuantity: event.target.value === '' ? '' : Number(event.target.value),
                              mergeExpiry: decision.mergeExpiry ?? conflict.existingPantryItem.expiryDate ?? null,
                              newExpiry: decision.newExpiry ?? null,
                            })
                          }
                          className="h-11 w-full rounded-2xl border border-[#ead9c7] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                        />
                      </label>

                      <label className="block max-w-xs">
                        <span className="mb-2 block text-sm font-medium text-[#4c4038]">Expiry date (optional)</span>
                        <input
                          type="date"
                          value={decision.mergeExpiry || ''}
                          onChange={(event) =>
                            setDecision(conflict.shoppingItem.id, {
                              action: 'merge',
                              mergeQuantity: decision.mergeQuantity ?? conflict.shoppingItem.quantity,
                              mergeExpiry: event.target.value || null,
                              newExpiry: decision.newExpiry ?? null,
                            })
                          }
                          className="h-11 w-full rounded-2xl border border-[#ead9c7] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label className="block max-w-xs">
                        <span className="mb-2 block text-sm font-medium text-[#4c4038]">Set expiry date (optional)</span>
                        <input
                          type="date"
                          value={decision.newExpiry || ''}
                          onChange={(event) =>
                            setDecision(conflict.shoppingItem.id, {
                              action: 'new',
                              newExpiry: event.target.value || null,
                            })
                          }
                          className="h-11 w-full rounded-2xl border border-[#ead9c7] bg-white px-4 text-sm text-[#111111] outline-none focus:border-[#ff7a18] focus:ring-4 focus:ring-[#ff7a18]/15"
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#ead9c7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm font-medium text-[#b16a2c]">{conflicts.length > 0 ? `${conflicts.length} item${conflicts.length === 1 ? '' : 's'} need your attention` : ''}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-[#d8cab9] bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#fff4ea]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm({ decisions, cleanItems })}
              className="inline-flex items-center justify-center rounded-2xl bg-[#ff7a18] px-6 py-3 text-sm font-semibold text-[#111111] shadow-[0_18px_30px_rgba(255,122,24,0.24)] transition-transform hover:-translate-y-0.5"
            >
              Confirm All ({conflicts.length + cleanItems.length} items)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
