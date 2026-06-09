import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => (
    <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <span className={styles.text}>Loading...</span>
    </div>
);

export default LoadingSpinner;
