import { formatWeekIndex, toWeekParam } from '../../lib/shtigje';
import type { PlayedWeek } from '../../lib/shtigjeStore';
import styles from './ShtigjeArchive.module.scss';

/*
 * Every week up to this one, newest first: the ones already played carry how
 * much of the grid came off, the rest are still open. Nothing here reaches
 * past the current week — a grid that has not turned over yet has no row.
 */

interface ShtigjeArchiveProps {
  /** The week the board is currently showing. */
  week: number;
  current: number;
  played: PlayedWeek[];
  onPick: (week: number) => void;
}

const getScore = (played: PlayedWeek | undefined) => {
  if (!played) {
    return { label: 'i panisur', done: false };
  }
  if (!played.score.solved) {
    return {
      label: `${played.score.found}/${played.score.words}`,
      done: false,
    };
  }
  return { label: 'i plotë', done: true };
};

const ShtigjeArchive = ({ week, current, played, onPick }: ShtigjeArchiveProps) => {
  const byWeek = new Map(played.map((entry) => [entry.week, entry]));
  const weeks = Array.from({ length: current + 1 }, (_, index) => current - index);

  return (
    <section className={styles.archive} aria-labelledby="shtigje-arkivi">
      <h2 className={`${styles.label} sc`} id="shtigje-arkivi">
        <span>Javët e kaluara</span>
        <span>{weeks.length} javë</span>
      </h2>

      <ul className={styles.list}>
        {weeks.map((index) => {
          const score = getScore(byWeek.get(index));
          const isCurrent = index === week;

          return (
            <li key={index} className={styles.row}>
              <a
                className={styles.link}
                href={`?j=${toWeekParam(index)}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onPick(index);
                }}
              >
                <span className={`${styles.number} sc`}>nr. {index + 1}</span>
                <span className={styles.date}>
                  {formatWeekIndex(index)}
                  {index === current && ' — kjo javë'}
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

export default ShtigjeArchive;
