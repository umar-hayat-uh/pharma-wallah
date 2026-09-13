import Image from "next/image";
import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/" aria-label="PharmaWallah home">
      <Image
        src= {'/images/logo/logo.svg'}
        alt="PharmaWallah"
        width={100}
        height={30}
        style={{ width: "auto", height: "auto" }}
        quality={100}
      />
    </Link>
  );
};

export default Logo;
