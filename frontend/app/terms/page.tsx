import Link from "next/link";
import style from "./page.module.scss";

export default function TermsPage() {
    return (
        <div className={style.termsPage}>
            <div className={style.card}>
                <p className={style.kicker}>Legal</p>
                <h1 className={style.title}>Terms and Conditions</h1>
                <p className={style.updated}>Last updated: March 20, 2026</p>
                <div className={style.content}>
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p> By creating an account and using this platform, you agree to follow these Terms and Conditions and all applicable laws and regulations. </p>
                    </section>
                    <section>
                        <h2>2. Account Responsibility</h2>
                        <p> You are responsible for the security of your account credentials and for all actions performed through your account. </p>
                    </section>
                    <section>
                        <h2>3. Purchases and Payments</h2>
                        <p> All purchases are processed through supported payment providers. Prices, promotions,and availability may change without prior notice. </p>
                    </section>
                    <section>
                        <h2>4. User Conduct</h2>
                        <p> You agree not to misuse the service, attempt unauthorized access, distribute malicious content, or violate rights of other users. </p>
                    </section>
                    <section>
                        <h2>5. Termination</h2>
                        <p> We may suspend or terminate accounts that violate these terms or threaten platform security and integrity. </p>
                    </section>
                    <section>
                        <h2>6. Contact</h2>
                        <p> If you have questions about these terms, please contact the support team. </p>
                    </section> </div> <div className={style.actions}>
                    <Link href="/auth" className={style.backLink}>Back to Sign Up</Link>
                </div>
            </div>
        </div>);
}