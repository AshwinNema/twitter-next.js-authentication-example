'use client';
import TwitterLogin from './_custom-twitter-component';
import styles from './page.module.css';

export default function Home() {
  return (
    <main>
      <div className={styles.container}>
        <TwitterLogin
          loginUrl="http://localhost:4000/auth/twitter"
          requestTokenUrl="http://localhost:4000/auth/twitter/request_token"
          onFailure={(err) => {
            console.log(err);
          }}
          onSuccess={(data) => {
            console.log(data);
          }}
        />
      </div>
    </main>
  );
}
