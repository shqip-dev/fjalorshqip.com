import { useRef } from 'react';
import styles from './SearchBar.module.scss';

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef?.current?.focus();
  }

  return (
    <div className={styles.searchbar} onClick={focusInput}>
        <input type="text" size={1} placeholder="Kërko" ref={inputRef} />
        <span className={styles.clearButton}>X</span>
    </div>
  );
};

export default SearchBar;
