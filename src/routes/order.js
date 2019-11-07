import React from 'react'
import {addOrder, makeOrderPaid, validateIMPPayment} from "../apis/api";
import OrderForm from "../components/OrderForm";
import styles from "../app.module.css"


class Order extends React.Component {

    make_order = async order_data => {
        await this.request_pay(order_data)
    }

    request_pay = order_data => {
        let IMP = window.IMP
        IMP.init('imp38282929') // 가맹점 식별코드
        IMP.request_pay({
            pg : 'html5_inicis',
            pay_method : 'card',
            merchant_uid : 'merchant_' + new Date().getTime(),
            name : '두드림퀵 배송 주문',
            amount : order_data.price,
            buyer_name : order_data.sender_name, // TODO: or username
            buyer_tel : order_data.sender_phone, // TODO: or user phone
            buyer_email: ''
        }, async response => {
            if (response.success) {
                const validated = await validateIMPPayment(response.imp_uid, order_data.price)
                if (validated === -2) {
                    alert("결제 승인 상태 확인에 실패했습니다. 두드림퀵 팀에 문의해주세요.")
                    return -1
                } else if (validated === -1) {
                    alert("결제 요청 금액과 실 결제 금액이 일치하지 않습니다. 두드림퀵 팀에 문의해주세요.")
                    return -1
                } else if (validated === 1) {
                    if (true) {
                        const order = await addOrder({...order_data})
                        await makeOrderPaid(order.id)
                        this.props.history.push("/order/complete")
                    } else {
                        // TODO: Add amount to the user's deposit
                        return 1
                    }
                } else {
                    alert("오류가 발생했습니다.")
                    return -1
                }
            } else {
                alert("결제에 실패했습니다. 오류 메시지: " + response.error_msg)
                return -1
            }
        })
    }

    render() {
        return (
            <div className={styles.contentContainer}>
                <OrderForm make_order={this.make_order}/>
            </div>
        )
    }
}

export default Order