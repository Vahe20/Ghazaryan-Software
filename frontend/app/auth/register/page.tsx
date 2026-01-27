import { Header } from "./components/Header";
import { Form } from './components/Form';
import style from "./style.module.scss";

export default function Register() {
    return (
        <div className={style.register}>
            <Header />
            <Form />
        </div>
    );
}
