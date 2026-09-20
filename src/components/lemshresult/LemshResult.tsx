import {
  formatSeconds,
  scoreRound,
  scoreWord,
  type Round,
  type WordResult,
} from '../../lib/lemsh';
import styles from './LemshResult.module.scss';

/*
 * The round, read back. Every word is a link to its own entry, which is the
 * point of hiding them behind a clock in the first place: a word that beat the
 * reader is a word they are one click from learning.
 */

interface LemshResultProps {
  round: Round;
  results: WordResult[];
  copied: boolean;
  onShare: () => void;
  onDefinition: (word: string) => void;
  /** Absent when the round being read back is already today's. */
  onToday?: () => void;
}

const LemshResult = ({
  round,
  results,
  copied,
  onShare,
  onDefinition,
  onToday,
}: LemshResultProps) => {
  const score = scoreRound(round, results);

  return (
    <section className={styles.result} aria-label="Përfundimi">
      <p className={styles.score}>
        <span className={styles.points}>{score.points}</span>
        <span className={`${styles.unit} sc`}>pikë</span>
      </p>

      <p className={`${styles.summary} sc`}>
        <span>
          {score.solved} nga {score.words} fjalë
        </span>
        <span>{formatSeconds(score.seconds)} gjithsej</span>
      </p>

      <ul className={styles.list}>
        {round.map((entry, index) => {
          const result = results[index];
          const solved = !!result?.solved;

          return (
            <li className={styles.row} key={entry.word}>
              <a
                className={styles.link}
                href={`/f/${entry.slug}`}
                onClick={() => onDefinition(entry.word)}
              >
                <span className={`${styles.number} sc`}>{index + 1}</span>
                <span className={styles.term} data-solved={solved ? 'true' : 'false'}>
                  {entry.word.toUpperCase()}
                </span>
                <span className={styles.note}>
                  {!result
                    ? 'e paluajtur'
                    : solved
                      ? formatSeconds(result.seconds)
                      : 'pa zgjidhur'}
                </span>
                <span className={styles.won}>
                  {result ? scoreWord(entry, result) : 0}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className={styles.formula}>
        Çdo fjalë e zgjidhur jep 10 pikë për shkronjë dhe nga një pikë për çdo
        sekondë të mbetur.
      </p>

      <div className={styles.actions}>
        <button type="button" className={`${styles.share} sc`} onClick={onShare}>
          {copied ? 'U kopjua' : 'Kopjo rezultatin'}
        </button>
        {onToday && (
          <a
            className={`${styles.todayLink} sc`}
            href="/leemsh"
            onClick={(event) => {
              event.preventDefault();
              onToday();
            }}
          >
            Lëmshi i sotëm
          </a>
        )}
      </div>
    </section>
  );
};

export default LemshResult;
