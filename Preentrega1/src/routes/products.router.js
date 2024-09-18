import { Router } from "express";
import { ProductManager } from "../managers/ProductManager.js";
const products = new ProductManager("./src/data/products.json");
const productRouter = Router();

//todos los productos
productRouter.get(`/`, async (req, res) => {
    let limit = parseInt(req.query.limit, 10);
    
    if(isNaN(limit) || limit <= 0){
        limit = null
    }

    try {
        const productList = await products.getProducts();
        if(limit){
            res.json(productList.slice(0, limit));
        }else{
            res.json(productList);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//producto por id
productRouter.get(`/:id`, async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if(isNaN(id)){
        return res.status(400).json({error: "El ID debe ser un numero valido"});
    }

    try {
        const product = await products.getProductById(parseInt(id));
        if (!product) {
            res.send("producto no encontrado")
        }else{
            res.json(product);
        }
    } catch (error) {
        res.status(500).send({ error: "Error en el servidor"});
    }
});

//producto eliminado
productRouter.delete(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
        await products.deleteProduct(Number(id));
        res.status(204).send();
    } catch (error) {
        res.status(404).send({ error: "Producto no encontrado." });
    }
});

//nuevo producto
productRouter.post(`/`, async (req, res) => {
    const { title, description, price, code, stock } = req.body;  

    if (!title || !description || price === undefined || !code || stock === undefined) {
        return res.status(400).send({status: 'Error', error: "Todos los campos son obligatorios excepto thumbnails" });
    }
    const status = req.body.status !== undefined ? req.body.status : true; 

    const thumbnails = req.body.thumbnails !== undefined ? req.body.thumbnails : []; 

    try {
        const newProduct = await products.addProduct({ title, description, price, code, stock, thumbnails, status });
        res.status(201).json(newProduct);
    } catch (error) {
        console.log(`Error de post ${error}`);
        res.status(400).send({ status: 'Error', error: error.message });
    }
});

//actualizo un producto
productRouter.put(`/:id`, async (req, res) => {
    const { id } = req.params;
    try {
        const updateProduct = await products.updateProduct(Number(id), req.body);
        res.json(updateProduct);
    } catch (error) {
        if (error.message === "Producto no encontrado.") {
            res.status(404).send({ error: error.message });
        } else {
            res.status(500).send({ error: error.message });
        }
    }
});

export default productRouter;