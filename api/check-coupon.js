import axios from "axios";

export default async function handler(req,res){
  if(req.method!=="POST"){
    return res.status(405).json({error:"Method not allowed"});
  }

  try{
    const body=await new Promise((resolve,reject)=>{
      let data="";
      req.on("data",chunk=>{data+=chunk;});
      req.on("end",()=>{try{resolve(JSON.parse(data||"{}"))}catch(err){reject(err)}});
    });

    const {coupon,cartId,authToken,userId,pin}=body;
    if(!coupon||!cartId||!authToken||!userId||!pin){
      return res.status(400).json({error:"Missing required fields"});
    }

    const response=await axios.get("https://www.jiomart.com/mst/rest/v1/5/cart/apply_coupon",{
      params:{coupon_code:coupon,cart_id:cartId},
      headers:{authtoken:authToken,userid:userId,pin,Accept:"application/json, text/plain, */*"},
      timeout:15000
    });

    const contentType=response.headers['content-type'] || '';
    if(!contentType.includes('application/json')){
      return res.status(429).json({ error: 'API blocked or non-JSON', retry: true });
    }

    const data=response.data || {};
    if(!data.result && !data.error){
      return res.status(502).json({error:"Unexpected API response", retry:true});
    }

    return res.status(200).json({coupon,result:data});

  }catch(err){
    const message=err.response?.data || err.message || "Unknown error";
    return res.status(500).json({error:message,retry:true});
  }
}
