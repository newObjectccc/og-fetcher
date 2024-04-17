import ogFetcher from "og-fetcher";
import { useEffect } from "react";

interface Props {
  text: string;
}

const OgCard = ({ text }: Props) => {
  useEffect(() => {
    ogFetcher("https://github.com").then(console.log);
    console.log("https://github.com");
  }, []);
  return <div>Example Component: {text}</div>;
};

export default OgCard;
