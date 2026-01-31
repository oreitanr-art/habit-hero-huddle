import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  title?: string;
}

export function PinDialog({ isOpen, onClose, onSuccess, correctPin, title = "הכנס קוד הורה" }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        setTimeout(() => {
          onSuccess();
          setPin("");
        }, 200);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClose = () => {
    setPin("");
    setError(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="card-kid w-full max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="h2-kid text-center mb-6">{title}</h2>

            {/* PIN dots */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={`
                    w-4 h-4 rounded-full
                    ${error 
                      ? "bg-destructive" 
                      : i < pin.length 
                        ? "bg-primary" 
                        : "bg-gray-200"
                    }
                  `}
                  animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((item, i) => (
                <motion.button
                  key={i}
                  className={`
                    h-16 rounded-2xl text-2xl font-black
                    ${item === null 
                      ? "invisible" 
                      : item === "del"
                        ? "btn-kid btn-ghost-kid"
                        : "btn-kid btn-primary-kid"
                    }
                  `}
                  onClick={() => {
                    if (item === "del") handleDelete();
                    else if (item !== null) handleDigit(String(item));
                  }}
                  whileTap={item !== null ? { scale: 0.95 } : {}}
                >
                  {item === "del" ? "⌫" : item}
                </motion.button>
              ))}
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-4 py-3 text-muted-foreground font-bold"
            >
              ביטול
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
