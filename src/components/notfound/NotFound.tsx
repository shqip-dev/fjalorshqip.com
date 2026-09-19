import styles from './NotFound.module.scss';

interface NotFoundProps {
  /** The word that was asked for, when a word was asked for at all. */
  word?: string;
}

const NotFound = ({ word }: NotFoundProps) => {
  if (word) {
    return (
      <div className={styles.notfound}>
        <h1 className={styles.title}>{word}</h1>
        <p className={styles.labels}>nuk u gjet në fjalor</p>
        <p className={styles.note}>
          Provoni trajtën e paskajuar të fjalës — kërkimi nuk i njeh format e
          lakuara e të zgjedhuara. Nëse fjala nuk është në këtë fjalor, nuk
          gjendet dot këtu.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.notfound}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.labels}>faqja nuk u gjet</p>
      <p className={styles.note}>
        Kjo adresë nuk ekziston. Kthehuni te <a href="/">ballina</a> dhe kërkoni
        fjalën.
      </p>
    </div>
  );
};

export default NotFound;
