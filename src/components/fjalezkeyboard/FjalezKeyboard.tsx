import { type Mark } from '../../lib/fjalez';
import styles from './FjalezKeyboard.module.scss';

/*
 * The keyboard a reader already has in front of them: QWERTY, with the two
 * letters the Latin alphabet does not carry placed where a German layout keeps
 * its own — Ë after P, where Ü sits, and Ç after L, where Ö and Ä sit. W is the
 * one QWERTY key missing, because the Albanian alphabet has no W and a key that
 * can never be part of a word is a key in the way. That leaves two rows of ten
 * over a row of seven, holding all 27 letters, each exactly once.
 */
const ROWS = [
  ['q', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ë'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/** The widest row sets the key width; the shorter ones centre against it. */
const COLUMNS = Math.max(...ROWS.map((row) => row.length));

interface FjalezKeyboardProps {
  /** The best thing learned about each letter so far. */
  marks: Record<string, Mark>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled: boolean;
}

/*
 * A key pressed with a pointer gives the focus straight back, so the next
 * Enter belongs to the guess rather than to the key that was just clicked. A
 * key reached with the Tab key keeps its focus — `detail` is 0 there — because
 * that reader is navigating by focus and has nowhere else to stand.
 */
const release = (event: React.MouseEvent<HTMLButtonElement>) => {
  if (event.detail !== 0) {
    event.currentTarget.blur();
  }
};

const LABEL: Record<Mark, string> = {
  correct: 'në vend',
  present: 'në fjalë, vend tjetër',
  absent: 'jo në fjalë',
};

const FjalezKeyboard = ({
  marks,
  onLetter,
  onEnter,
  onBackspace,
  disabled,
}: FjalezKeyboardProps) => {
  return (
    <div
      className={styles.keyboard}
      style={{ '--columns': COLUMNS } as React.CSSProperties}
    >
      {ROWS.map((row, index) => (
        <div
          className={styles.row}
          key={`row-${index}`}
          style={{ '--keys': row.length } as React.CSSProperties}
        >
          {row.map((letter) => {
            const mark = marks[letter];

            return (
              <button
                key={letter}
                type="button"
                className={styles.key}
                data-mark={mark || 'unknown'}
                disabled={disabled}
                onClick={(event) => {
                  release(event);
                  onLetter(letter);
                }}
                aria-label={
                  mark
                    ? `${letter.toUpperCase()} — ${LABEL[mark]}`
                    : letter.toUpperCase()
                }
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}

      <div className={styles.actions} style={{ '--keys': 2 } as React.CSSProperties}>
        <button
          type="button"
          className={`${styles.action} sc`}
          onClick={(event) => {
            release(event);
            onBackspace();
          }}
          disabled={disabled}
        >
          Fshij
        </button>
        <button
          type="button"
          className={`${styles.action} ${styles.submit} sc`}
          onClick={(event) => {
            release(event);
            onEnter();
          }}
          disabled={disabled}
        >
          Provo
        </button>
      </div>
    </div>
  );
};

export default FjalezKeyboard;
