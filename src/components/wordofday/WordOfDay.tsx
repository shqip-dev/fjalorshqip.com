import { track } from '../../lib/analytics';
import { formatDay, getWordOfDay } from '../../lib/wordOfDay';
import styles from './WordOfDay.module.scss';

/*
 * The one thing the home page says when nobody has typed yet. It is set as a
 * small entry rather than a card — the same headword, label stack and sense the
 * word's own page uses — so the page teaches what an entry looks like before
 * the visitor has asked for one.
 */
const WordOfDay = () => {
  const today = new Date();
  const word = getWordOfDay(today);

  return (
    <section className={styles.wordofday} aria-labelledby="fjala-e-dites">
      <h2 className={`${styles.label} sc`} id="fjala-e-dites">
        <span>Fjala e ditës</span>
        <span className={styles.date}>{formatDay(today)}</span>
      </h2>

      <a
        className={styles.entry}
        href={`/f/${word.slug}`}
        onClick={() =>
          track('word_of_day', {
            w: word.term,
            // The word's own UTC day, which near midnight is not the day the
            // event's timestamp will land on.
            d: today.toISOString().slice(0, 10),
          })
        }
      >
        <span className={styles.term}>{word.term}</span>
        {word.attributes.length !== 0 && (
          <span className={styles.attributes}>{word.attributes.join(' ')}</span>
        )}
      </a>

      <p className={styles.gist}>{word.gist}</p>
    </section>
  );
};

export default WordOfDay;
