import { Header } from "./components/Header";
import { Form } from './components/Form';
import style from "./style.module.scss";

export default function Login() {
    return (
        <div className={style.login}>
            <Header />
            <Form />
        </div>
    );
}
