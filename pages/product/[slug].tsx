import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "../../components/Layout";
import Feature from "../../components/Feature";
import { ProductProps } from "../../components/Product";
import Loader from "../../components/Loader";
import RelatedProducts from "../../components/RelatedProducts";
import { IconBrandTwitter, IconBrandFacebook } from "@tabler/icons";
import prisma from "../../lib/prisma";
import axios from "axios";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const product = await prisma.product.findUnique({
    where: {
      slug: String(params?.slug),
    },
  });
  return {
    props: product,
  };
};

const Product: React.FC<ProductProps> = (props) => {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 16000);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `https://amazon-product-scrapper.p.rapidapi.com/products/${props.asin}`,
        {
          params: {
            api_key: process.env.NEXT_PUBLIC_AMAZON_SCRAPPER_API_KEY,
          },
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_XRAPID_API_KEY,
            "x-rapidapi-host": "amazon-web-scrapper.p.rapidapi.com",
          },
        }
      )
      .then((response) => {
        !price && setPrice(response.data.pricing);
        price && setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props]);

  useEffect(() => {
    if (price.includes("-")) {
      let index = price.indexOf("-");
      let firstPrice = price.slice(0, index);
      setPrice(`from ${firstPrice}`);
    } else {
      setPrice(price);
    }
  }, [price]);

  return (
    <Layout>
      <Head>
        <title>{props.name}</title>
        <meta name="description" content={props.description} />
        <meta
          property="og:url"
          content={`https://www.omitplastic.com/product/${props.slug}`}
        />
        <meta property="og:title" content={props.name} />
        <meta property="og:description" content={props.description} />
        <meta property="og:image" content={props.imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={props.name} />
        <meta name="twitter:description" content={props.description} />
        <meta name="twitter:image" content={props.imageUrl} />
      </Head>
      <div className="grid grid-cols-1 sm:grid-cols-4 sm:gap-8 p-4 md:px-8">
        <div className="col-span-2 flex flex-col justify-start items-start my-2 md:my-6">
          <div className="w-full flex justify-center">
            <img src={props.imageUrl} alt={props.name} className="max-h-96" />
          </div>
          <div className="flex justify-center items-center mt-6 md:mt-8">
            <h2 className="mr-2">Share:</h2>
            <div className="border-2 border-black border-solid rounded-full mr-2 p-2">
              <a
                href={`https://twitter.com/intent/tweet?text=Check%20out%20the%20${props.name}%20at%20OmitPlastic%20\nomitplastic.com/product/${props.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-black"
              >
                <IconBrandTwitter size={28} stroke={1.5} />
              </a>
            </div>
            <div className="border-2 border-black border-solid rounded-full mr-2 p-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://omitplastic.com/product/${props.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-black"
              >
                <IconBrandFacebook size={28} stroke={1.5} />
              </a>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <h2 className="font-serif py-4 leading-snug">{props.name}</h2>
          <p>{props.description}</p>
          <div className="mt-8">
            <h2 className="font-serif mb-2">Features:</h2>
            <ul>
              {props.features.map((feature, index) => (
                <a
                  key={index}
                  href={`/products/?s=${feature.replace(/-/g, " ")}`}
                  className="text-black"
                >
                  <Feature key={index} feat={feature} text />
                </a>
              ))}
            </ul>
            <p className="my-8">
              When you buy this product using our links, we may earn an
              affiliate commission.
            </p>
          </div>

          <ul className="sticky bottom-0 flex justify-center items-center flex-col mt-8">
            {props.urls.map((url, index) => (
              <li key={index} className="mb-3">
                <button key={index} className="h-14">
                  <a
                    key={index}
                    href={Object.values(url)[0]}
                    target="_blank"
                    className="transitions-all duration-300 border-solid border-2 border-black rounded-full py-2 px-3 bg-black hover:bg-white font-serif text-xl text-white hover:text-black shadow-md flex justify-center items-center"
                  >
                    <p>Buy at {Object.keys(url)[0]} </p>
                    <div className="ml-1">
                      {Object.keys(url)[0] === "Amazon" &&
                        (loading ? <Loader /> : price)}
                    </div>
                  </a>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <RelatedProducts id={props.id} type={props.type} />
      <div className="py-8 px-4 md:px-8 text-gray-500">
        <p>
          Disclaimer: While we strive to ensure that product information is
          correct, manufacturers may change their product's specifications.
          Actual product packaging and materials may contain different
          information than that shown on this web site. Content on this site is
          for reference purposes only. OmitPlastic.com assumes no liability for
          inaccuracies or misstatements about products.
        </p>
      </div>
    </Layout>
  );
};

export default Product;
