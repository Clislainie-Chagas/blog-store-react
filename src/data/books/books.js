import universoParalelo from "../../assets/images/CapaLivroUnivers.jpg";
import amizadeColorida from "../../assets/images/CapaLivroAmiza_.jpg";
import envelhecimentoPrecoce from "../../assets/images/CapaEnvelhece.jpg";

const books = [
  {
    id: 1,
    title: "Entre Universos Paralelos",
    author: "Clis Chagas",
    category: "Romance",
    price: 79.90,
    rating: 5,
    cover: universoParalelo,
    description:
      "Uma jornada entre mundos, segredos e histórias esquecidas, onde cada descoberta pode mudar para sempre o destino daqueles que ousam atravessar os limites do conhecido.",
  },
  {
    id: 2,
    title: "Amizade Colorida",
    author: "Clis Chagas",
    category: "Conto Erótico",
    price: 19.90,
    rating: 4,
    cover: amizadeColorida,
    description:
      "Uma jornada entre mundos, segredos e histórias esquecidas, onde cada descoberta pode mudar para sempre o destino daqueles que ousam atravessar os limites do conhecido.",
  },
  {
    id: 3,
    title: "Envelhecimento Precoce",
    author: "Clis Chagas",
    category: "Ficção Científica",
    price: 69.90,
    rating: 5,
    cover: envelhecimentoPrecoce,
    description:
      "Uma jornada entre mundos, segredos e histórias esquecidas, onde cada descoberta pode mudar para sempre o destino daqueles que ousam atravessar os limites do conhecido.",
  }
];

export default books;