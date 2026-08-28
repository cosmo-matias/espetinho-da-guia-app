import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_PRODUCTS = [
  // ESPETINHOS
  { name: 'Pão de Alho', category: 'ESPETINHOS', price: 2.00, stockQuantity: 0 },
  { name: 'Moela', category: 'ESPETINHOS', price: 5.00, stockQuantity: 0 },
  { name: 'Porco', category: 'ESPETINHOS', price: 6.00, stockQuantity: 0 },
  { name: 'Frango', category: 'ESPETINHOS', price: 6.00, stockQuantity: 0 },
  { name: 'Asa c/ Coxa', category: 'ESPETINHOS', price: 6.00, stockQuantity: 0 },
  { name: 'Kafta c/ Queijo', category: 'ESPETINHOS', price: 6.00, stockQuantity: 0 },
  { name: 'Ovo c/ Bacon', category: 'ESPETINHOS', price: 7.00, stockQuantity: 0 },
  { name: 'Coração', category: 'ESPETINHOS', price: 7.00, stockQuantity: 0 },
  { name: 'Camarão', category: 'ESPETINHOS', price: 8.00, stockQuantity: 0 },
  { name: 'Carne', category: 'ESPETINHOS', price: 8.00, stockQuantity: 0 },
  { name: 'Frango c/ Bacon', category: 'ESPETINHOS', price: 8.00, stockQuantity: 0 },
  { name: 'Queijo', category: 'ESPETINHOS', price: 8.00, stockQuantity: 0 },
  { name: 'Queijo c/ Carne de Sol', category: 'ESPETINHOS', price: 10.00, stockQuantity: 0 },
  // ADICIONAIS
  { name: 'Adicional de Arroz ou Macaxeira', category: 'ADICIONAIS', price: 2.00, stockQuantity: 0 },
  // CALDOS
  { name: 'Caldo (Porção)', category: 'CALDOS', price: 5.00, stockQuantity: 0 },
  // BEBIDAS - CERVEJAS LITRÃO
  { name: 'Budweiser Litrão', category: 'BEBIDAS', price: 15.00, stockQuantity: 0 },
  { name: 'Antártica Litrão', category: 'BEBIDAS', price: 12.00, stockQuantity: 0 },
  { name: 'Skol Litrão', category: 'BEBIDAS', price: 12.00, stockQuantity: 0 },
  { name: 'Brama chopp Litrão', category: 'BEBIDAS', price: 12.00, stockQuantity: 0 },
  { name: 'Cristal Litrão', category: 'BEBIDAS', price: 10.00, stockQuantity: 0 },
  // BEBIDAS - CERVEJAS LATA
  { name: 'Heineken Lata', category: 'BEBIDAS', price: 10.00, stockQuantity: 0 },
  { name: 'Budweiser Lata', category: 'BEBIDAS', price: 8.00, stockQuantity: 0 },
  { name: 'Antártica Lata', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Skol Lata', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Brama chopp Lata', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Brama duplo malte Lata', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Petra Lata', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Cristal Lata', category: 'BEBIDAS', price: 4.00, stockQuantity: 0 },
  // BEBIDAS - REFRIGERANTES 1L
  { name: 'Coca 1L', category: 'BEBIDAS', price: 10.00, stockQuantity: 0 },
  { name: 'Kuat guarana 1L', category: 'BEBIDAS', price: 10.00, stockQuantity: 0 },
  { name: 'Fanta laranja 1L', category: 'BEBIDAS', price: 10.00, stockQuantity: 0 },
  // BEBIDAS - REFRIGERANTES 350ML
  { name: 'Coca 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Coca zero 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Guarana Antártica 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Kuat guarana 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Fanta laranja 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Fanta uva 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Sprite 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  { name: 'Sprite zero 350ml', category: 'BEBIDAS', price: 5.00, stockQuantity: 0 },
  // CACHAÇAS
  { name: 'Matuta (sabores) 1L', category: 'CACHACAS', price: 40.00, stockQuantity: 0 },
  { name: 'Serra de areia 1L', category: 'CACHACAS', price: 30.00, stockQuantity: 0 },
  { name: 'Montilla 1L', category: 'CACHACAS', price: 30.00, stockQuantity: 0 },
  { name: 'Dreher 1L', category: 'CACHACAS', price: 26.00, stockQuantity: 0 },
  { name: 'Matuta coco nut 300ml', category: 'CACHACAS', price: 16.00, stockQuantity: 0 },
  { name: 'Matuta (sabores) 300ml', category: 'CACHACAS', price: 15.00, stockQuantity: 0 },
  { name: 'Serra de areia 275ml', category: 'CACHACAS', price: 12.00, stockQuantity: 0 },
  { name: 'Triunfo 275ml', category: 'CACHACAS', price: 12.00, stockQuantity: 0 },
  { name: 'Matuta Dose', category: 'CACHACAS', price: 5.00, stockQuantity: 0 },
  { name: 'Serra de areia Dose', category: 'CACHACAS', price: 3.00, stockQuantity: 0 },
  { name: 'Montilla Dose', category: 'CACHACAS', price: 3.00, stockQuantity: 0 },
  { name: 'Dreher Dose', category: 'CACHACAS', price: 2.00, stockQuantity: 0 },
];

async function seed() {
  console.log('Seeding products...');
  for (const item of INITIAL_PRODUCTS) {
    await addDoc(collection(db, 'products'), item);
    console.log(`Added: ${item.name}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
