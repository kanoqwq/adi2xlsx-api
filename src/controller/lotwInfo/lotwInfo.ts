import Koa from 'koa'
import { getQsoJsonData } from "../../core"
import { exportToXlsx } from "../../core/actions/exportToxlsx"
export default {

    //导出
    exportFile: async (ctx: Koa.Context): Promise<void> => {
        try {
            const file: any = ctx.request.files?.files; // 使用 'any' 类型来处理文件对象

            // 检查是否有文件上传
            if (!file) {
                ctx.status = 400;
                ctx.body = { message: '请选择要上传的文件' };
                return;
            }

            let adiFile: any = null
            if (file[0]) {
                adiFile = file[0]
            } else {
                adiFile = file
            }

            const resData: any = await getQsoJsonData(adiFile)
            if (!resData.ok) {
                ctx.status = 400;
                ctx.body = { message: '转换失败' };
                return;
            }
            const jsonData = resData.data.map((item: any) => {
                return {
                    'MY CALL': item.STATION_CALLSIGN,
                    CALL: item.CALL,
                    COUNTRY: item.COUNTRY,
                    MODE: item.MODE,
                    SAT: item.SAT_NAME,
                    TX: item.FREQ,
                    RX: item.FREQ_RX,
                    GRID: item.GRIDSQUARE,
                    'MY GRID': item.MY_GRIDSQUARE,
                    'IS QSL?': item.QSL_RCVD == 'Y' ? "YES" : 'NO',
                    'QSL DATE': `${item.QSO_DATE?.substring(0, 4)}-${item.QSO_DATE?.substring(4, 6)}-${item.QSO_DATE?.substring(6, 8)} ${item.TIME_ON?.substring(0, 2)}:${item.TIME_ON?.substring(2, 4)}:${item.TIME_ON?.substring(4, 6)}`,
                    // 'TIME ON': `${item.TIME_ON?.substring(0, 2)}:${item.TIME_ON?.substring(2, 4)}:${item.TIME_ON?.substring(4, 6)}`,
                }
            })
            if (resData.data.length !== 0) {
                const resStream = exportToXlsx({ jsonData });
                if (resStream) {
                    // 设置content-type请求头
                    ctx.set('Content-Type', 'application/vnd.openxmlformats');
                    // 设置文件名信息请求头
                    ctx.set('Content-Disposition', "attachment; filename=" + encodeURIComponent("QSO") + ".xlsx");
                    // 文件名信息由后端返回时必须设置该请求头,否则前端拿不到Content-Disposition响应头信息
                    ctx.set("Access-Control-Expose-Headers", "Content-Disposition")
                    // 将buffer返回给前端
                    ctx.body = resStream
                } else {
                    throw new Error('export to file failed')
                }
            } else {
                throw new Error('请上传正确的ADI文件!')
            }
        } catch (e: any) {
            ctx.response.status = 500
            ctx.body = {
                code: 500,
                message: e.message
            }
        }
    },
}