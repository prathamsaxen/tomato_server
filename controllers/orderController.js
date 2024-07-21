import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
    const frontend_url = process.env.frontendurl;

    try {
        const { userId, items, amount, address } = req.body;
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

       
        const newOrder = new orderModel({
            userId: userId,
            items: items,
            amount: amount,
            address: address
        });
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        const line_items = items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 80 
            },
            quantity: item.quantity
        }));

       
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 * 80
            },
            quantity: 1
        });

        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], 
            line_items: line_items,
            mode: "payment", 
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const verifyOrder = async(req,res)=>{
   const {orderId, success} = req.body;
   try {
    if(success == "true"){
        await orderModel.findByIdAndUpdate(orderId,{payment:true})
        res.json({success:true,message:"Paid"})
    }
    else{
        await orderModel.findByIdAndDelete(orderId)
        res.json({success:false,message:"Not Paid"})
    }
   } catch (error) {
      console.log(error);
      res.json({success:false,message:"Error"})
   }
}

const userOrders = async(req,res)=>{
    try {
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

const listOrders = async(req,res)=>{
   try {
    const orders = await orderModel.find({})
    res.json({success:true,data:orders})
   } catch (error) {
     console.log(error)
     res.json({success:false,message:"Error"})
   }
}

const updateStatus = async(req,res)=>{
     try {
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
     } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
     }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
