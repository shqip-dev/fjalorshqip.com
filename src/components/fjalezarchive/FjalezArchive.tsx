import { MAX_GUESSES, formatDayIndex, toDayParam } from '../../lib/fjalez';
import type { PlayedDay } from '../../lib/fjalezStore';
import styles from './FjalezArchive.module.scss';

/*
 * Every day up to today, newest first: the ones already played carry their
 * score, the rest are still open. Nothing here reaches past today — a word that
 * has not turned over yet has no row.
 */

interface FjalezArchiveProps {
  /** The day the board is currently showing. */
  day: number;
  today: number;
  played: PlayedDay[];
  onPick: (day: number) => void;
}

const getScore = (played: PlayedDay | undefined) => {
  if (!played) {
    return { label: 'e panisur', done: false };
  }
  if (played.outcome === 'won') {
    return { label: `${played.guesses.length}/${MAX_GUESSES}`, done: true };
  }
  if (played.outcome === 'lost') {
    return { label: `×/${MAX_GUESSES}`, done: true };
  }
  return { label: 'në vazhdim', done: false };
};

const FjalezArchive = ({ day, today, played, onPick }: FjalezArchiveProps) => {
  const byDay = new Map(played.map((entry) => [entry.day, entry]));
  const days = Array.from({ length: today + 1 }, (_, index) => today - index);

  return (
    <section className={styles.archive} aria-labelledby="fjalez-arkivi">
      <h2 className={`${styles.label} sc`} id="fjalez-arkivi">
        <span>Ditët e kaluara</span>
        <span>{days.length} fjalëza</span>
      </h2>

      <ul className={styles.list}>
        {days.map((index) => {
          const score = getScore(byDay.get(index));
          const isCurrent = index === day;

          return (
            <li key={index} className={styles.row}>
              <a
                className={styles.link}
                href={`?d=${toDayParam(index)}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onPick(index);
                }}
              >
                <span className={`${styles.number} sc`}>nr. {index + 1}</span>
                <span className={styles.date}>
                  {formatDayIndex(index)}
                  {index === today && ' — sot'}
                </span>
                <span
                  className={styles.score}
                  data-done={score.done ? 'true' : 'false'}
                >
                  {score.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FjalezArchive;
