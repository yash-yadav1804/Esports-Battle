import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

const LandingPage = () => {
  return (
    <main className={styles.page}>
      <header className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>E</span>
          Esports Battle
        </Link>

        <div className={styles.navActions}>
          <Link to="/tournaments" className={styles.secondaryLink}>
            View Tournaments
          </Link>

          <Link to="/login" className={styles.loginButton}>
            Login
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>MERN Tournament Management Platform</p>

          <h1>
            Manage esports tournaments, teams, match rooms, and results from one
            powerful platform.
          </h1>

          <p className={styles.heroText}>
            Esports Battle helps players join tournaments, organizers manage
            rooms, and admins control approvals, teams, results, and platform
            activity with clean role-based workflows.
          </p>

          <div className={styles.heroActions}>
            <Link to="/login" className={styles.primaryButton}>
              Get Started
            </Link>

            <Link to="/tournaments" className={styles.outlineButton}>
              Explore Tournaments
            </Link>
          </div>

          <div className={styles.trustRow}>
            <span>Players</span>
            <span>Organizers</span>
            <span>Admins</span>
            <span>SuperAdmin</span>
          </div>
        </div>

        <div className={styles.heroCard}>
          <div className={styles.cardTop}>
            <span className={styles.liveDot}></span>
            Platform Overview
          </div>

          <div className={styles.statsGrid}>
            <div>
              <strong>Role Based</strong>
              <span>Access Control</span>
            </div>

            <div>
              <strong>Secure</strong>
              <span>JWT Auth</span>
            </div>

            <div>
              <strong>Real Flow</strong>
              <span>Team Requests</span>
            </div>

            <div>
              <strong>Managed</strong>
              <span>Result Review</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Core Features</p>
          <h2>Everything needed for a tournament workflow</h2>
        </div>

        <div className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <h3>Team Management</h3>
            <p>
              Players can create teams, send join requests, accept members,
              transfer captaincy, and manage their own squad.
            </p>
          </article>

          <article className={styles.featureCard}>
            <h3>Tournament Control</h3>
            <p>
              Organizers can create and manage their own tournaments while
              admins and superAdmins can manage the full platform.
            </p>
          </article>

          <article className={styles.featureCard}>
            <h3>Match Room Security</h3>
            <p>
              Room passwords stay hidden publicly and are visible only to
              eligible registered teams or authorized managers.
            </p>
          </article>

          <article className={styles.featureCard}>
            <h3>Result Approval</h3>
            <p>
              Submitted results go through approval, with ownership rules so
              organizers review only their own tournament results.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.workflow}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Workflow</p>
          <h2>How the platform works</h2>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span>01</span>
            <h3>Player joins</h3>
            <p>
              Player registers, creates or joins a team, and enters tournaments.
            </p>
          </div>

          <div className={styles.step}>
            <span>02</span>
            <h3>Organizer manages</h3>
            <p>Approved organizer creates tournaments and match rooms.</p>
          </div>

          <div className={styles.step}>
            <span>03</span>
            <h3>Results reviewed</h3>
            <p>
              Players submit results, and authorized reviewers approve them.
            </p>
          </div>

          <div className={styles.step}>
            <span>04</span>
            <h3>Leaderboard updates</h3>
            <p>
              Approved results power standings, winners, and prize workflows.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <Link to="/" className={styles.footerLogo}>
            <span className={styles.logoMark}>E</span>
            Esports Battle
          </Link>

          <p>
            MERN-based esports tournament management platform built for teams,
            organizers, and admins.
          </p>
        </div>

        <div className={styles.footerLinks}>
          <Link to="/tournaments">Tournaments</Link>
          <Link to="/login">Login</Link>
          <a
            href="https://github.com/yash-yadav1804"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/yash-yadav-18y/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>

        <div className={styles.copyright}>
          © 2026 Esports Battle. Built with MERN Stack.
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
