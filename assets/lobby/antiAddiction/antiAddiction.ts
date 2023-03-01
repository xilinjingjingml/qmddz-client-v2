import BasePop from "../../base/view/BasePop"
import { appfunc } from "../../lobby/appfunc"
import { storage } from "../../base/storage"
import { startFunc } from "../../start/startFunc"

const {ccclass, property} = cc._decorator;

@ccclass
export default class antiAddiction extends BasePop {

    onPressSubmitInfo(){
        //TODO 提交信息
        let idCard = this.$("editIDcard", cc.EditBox).string
        let realName = this.$("editName", cc.EditBox).string
        let reg = /^[\u4e00-\u9fa5]{2,6}$/;
        if (!reg.test(realName)) {
            startFunc.showToast("姓名格式有误")
            return
        }

        var reg_idCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
        if(!reg_idCard.test(idCard)){
            startFunc.showToast("身份证格式有误")
            return
        }
        
        appfunc.UpdateAntiAddition(idCard, realName, (state)=>{
            if(state){
                this.params.closeCallback()
                this.close()
            }
            console.log("jin---state: ", state)
            storage.set("anti_addiction_valid", state)
            
        })
    }

    onpressReturnLogin(){
        console.log("jin---onpressReturnLogin")
        //TODO 退出游戏
        cc.game.end()
    }
}
