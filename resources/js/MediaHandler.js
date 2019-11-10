export default class MediaHandler{

    getPermission(){
        return new Promise((res , req) =>{
            navigator.mediaDevices.getUserMedia({video:true,audio:true})
            .then((streem) => {
                res(streem)
            }).catch((err)=>{
                throw new Error(`Unable to fetch stream ${err}`)
            });
        });
    }

}