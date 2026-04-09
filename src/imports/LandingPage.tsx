import svgPaths from "./svg-kp42holich";
import clsx from "clsx";
import imgCard from "figma:asset/7b036f0def38890da85845dea420dce7be635e7b.png";
import imgCard1 from "figma:asset/9bc757fe468301f3f949d43591e190f04eaa92e5.png";
import imgCard2 from "figma:asset/6a829c444afdd21fb80deec626c56aae1914fb44.png";
import imgCard3 from "figma:asset/8b85d985aa6b5d48bc71da07138b43df72634b6c.png";
import imgCard4 from "figma:asset/88841bcff86785f6533417c8d5b2e660067bec14.png";
import imgCard5 from "figma:asset/68b6765628f6a551e42d2b805301e4324b252ca4.png";
import imgCard6 from "figma:asset/c3253d272ee5f6f5e4e3c67372a5f254f8c99c00.png";
import imgCard7 from "figma:asset/f2cd00475b3c7972d68fdf63ea3c96773b86355e.png";
import imgCard8 from "figma:asset/14c71aff2b35dd7984f156dcd162ed99a2627bf0.png";
import imgCard9 from "figma:asset/1e8abeee27e1dd893882af596613fd5f2951fdf3.png";
import imgPlumberPointingLateral1 from "figma:asset/f8753a86a0116e655ab5c9abbc0b60499a42b757.png";
import imgImageProfessionalHandymanWithTools from "figma:asset/90c5a586ebbc9af9ab11fed5fa3a6ca8893cb1e9.png";

function BackgroundImage6({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[228px] relative shrink-0 w-[382px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[24px] px-[24px] relative size-full">{children}</div>
    </div>
  );
}

function CardContentBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[382px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-0 pt-[24px] px-[24px] relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage5Props = {
  additionalClassNames?: string;
};

function BackgroundImage5({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage5Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}

function HowItWorksBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute h-[28px] left-[24px] top-[96px] w-[270px]">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#0a0a0a] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">{children}</p>
    </div>
  );
}

function CardBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[189px] pointer-events-none relative rounded-tl-[10px] rounded-tr-[10px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute inset-0 rounded-tl-[10px] rounded-tr-[10px]">
        {children}
      </div>
      <div aria-hidden="true" className="absolute border-[2px_2px_0px] border-[rgba(0,0,0,0.1)] border-solid inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
    </div>
  );
}
type BackgroundImage4Props = {
  additionalClassNames?: string;
};

function BackgroundImage4({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage4Props>) {
  return (
    <div className={clsx("h-[28px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage3Props = {
  additionalClassNames?: string;
};

function BackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage3Props>) {
  return (
    <div className={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function BackgroundImage2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        {children}
      </svg>
    </div>
  );
}

function BackgroundImage1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type IconBackgroundImage5Props = {
  additionalClassNames?: string;
};

function IconBackgroundImage5({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImage5Props>) {
  return (
    <div className={clsx("absolute size-[16px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function IconBackgroundImage4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[28px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}
type IconBackgroundImage3Props = {
  additionalClassNames?: string;
};

function IconBackgroundImage3({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImage3Props>) {
  return (
    <div className={clsx("absolute size-[180px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 180 180">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function ComponentBackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <BackgroundImage1>
      <g id="Component 11">{children}</g>
    </BackgroundImage1>
  );
}

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <BackgroundImage2>
      <g id="Icon">{children}</g>
    </BackgroundImage2>
  );
}
type BackgroundImageAndText2Props = {
  text: string;
};

function BackgroundImageAndText2({ text }: BackgroundImageAndText2Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#364153] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">{text}</p>
    </div>
  );
}
type BackgroundImageAndText1Props = {
  text: string;
};

function BackgroundImageAndText1({ text }: BackgroundImageAndText1Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#d1d5dc] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type LinkBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function LinkBackgroundImageAndText({ text, additionalClassNames = "" }: LinkBackgroundImageAndTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex h-[19px] items-start left-0 top-[2.5px]", additionalClassNames)}>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#d1d5dc] text-[16px] text-nowrap tracking-[-0.3125px]">{text}</p>
    </div>
  );
}
type HeadingBackgroundImageAndTextProps = {
  text: string;
};

function HeadingBackgroundImageAndText({ text }: HeadingBackgroundImageAndTextProps) {
  return (
    <div className="h-[27px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] left-0 not-italic text-[18px] text-nowrap text-white top-[0.5px] tracking-[-0.4395px]">{text}</p>
    </div>
  );
}
type ContainerBackgroundImageAndText4Props = {
  text: string;
};

function ContainerBackgroundImageAndText4({ text }: ContainerBackgroundImageAndText4Props) {
  return (
    <div className="h-[20px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-[rgba(0,0,0,0.8)] text-nowrap top-[0.5px] tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type ContainerBackgroundImageAndText3Props = {
  text: string;
};

function ContainerBackgroundImageAndText3({ text }: ContainerBackgroundImageAndText3Props) {
  return (
    <div className="content-stretch flex h-[36px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[36px] not-italic relative shrink-0 text-[30px] text-black text-nowrap tracking-[0.3955px]">{text}</p>
    </div>
  );
}
type TextBackgroundImageAndTextProps = {
  text: string;
};

function TextBackgroundImageAndText({ text }: TextBackgroundImageAndTextProps) {
  return (
    <BackgroundImage4 additionalClassNames="w-[17.773px]">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-[9px] not-italic text-[20px] text-black text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%]">{text}</p>
    </BackgroundImage4>
  );
}
type ContainerBackgroundImageAndText2Props = {
  text: string;
};

function ContainerBackgroundImageAndText2({ text }: ContainerBackgroundImageAndText2Props) {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[132.87px] not-italic text-[#ab7501] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">{text}</p>
    </div>
  );
}

function IconBackgroundImage2() {
  return (
    <BackgroundImage>
      <path d={svgPaths.p203f1380} fill="var(--fill-0, #F1A400)" id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </BackgroundImage>
  );
}

function IconBackgroundImage1() {
  return (
    <BackgroundImage>
      <path d={svgPaths.p4d81680} fill="var(--fill-0, #F1A400)" id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </BackgroundImage>
  );
}
type ContainerBackgroundImageAndText1Props = {
  text: string;
};

function ContainerBackgroundImageAndText1({ text }: ContainerBackgroundImageAndText1Props) {
  return (
    <div className="h-[20px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6a7282] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">{text}</p>
    </div>
  );
}
type ContainerBackgroundImageAndTextProps = {
  text: string;
};

function ContainerBackgroundImageAndText({ text }: ContainerBackgroundImageAndTextProps) {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#101828] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">{text}</p>
    </div>
  );
}

function IconBackgroundImage() {
  return (
    <BackgroundImage>
      <path d={svgPaths.p3376b800} fill="var(--fill-0, #F1A400)" id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </BackgroundImage>
  );
}
type BackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function BackgroundImageAndText({ text, additionalClassNames = "" }: BackgroundImageAndTextProps) {
  return (
    <div className={clsx("absolute h-[28px]", additionalClassNames)}>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#101828] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">{text}</p>
    </div>
  );
}
type HowItWorksBackgroundImageAndTextProps = {
  text: string;
};

function HowItWorksBackgroundImageAndText({ text }: HowItWorksBackgroundImageAndTextProps) {
  return (
    <div className="absolute bg-black content-stretch flex items-center justify-center left-[24px] rounded-[1.67772e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[48px] top-[32px]">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[28px] not-italic relative shrink-0 text-[#f7c876] text-[20px] text-nowrap tracking-[-0.4492px]">{text}</p>
    </div>
  );
}
type PrimitiveButtonBackgroundImageAndTextProps = {
  text: string;
  additionalClassNames?: string;
};

function PrimitiveButtonBackgroundImageAndText({ text, additionalClassNames = "" }: PrimitiveButtonBackgroundImageAndTextProps) {
  return (
    <div className={clsx("h-[53px] justify-self-stretch relative rounded-[14px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[9px] py-[13px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#0a0a0a] text-[18px] text-center text-nowrap tracking-[-0.4395px]">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return <div className="bg-[rgba(0,0,0,0.3)] h-[48px] shrink-0 w-px" data-name="Container" />;
}

export default function LandingPage() {
  return (
    <div className="bg-white relative size-full" data-name="Landing Page">
      <div className="absolute bg-white content-stretch flex flex-col h-[64px] items-start left-0 px-[292px] py-0 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-0 w-[1800px]" data-name="Header">
        <div className="content-stretch flex h-[64px] items-center justify-between relative shrink-0 w-full" data-name="Navigation">
          <div className="h-[40px] relative shrink-0 w-[170.398px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
              <BackgroundImage5 additionalClassNames="bg-[#f7c876] rounded-[10px] size-[40px]">
                <BackgroundImage4 additionalClassNames="w-[26.234px]">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[20px] text-black text-nowrap top-0 tracking-[-0.4492px]">FH</p>
                </BackgroundImage4>
              </BackgroundImage5>
              <BackgroundImage3 additionalClassNames="h-[32px]">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[#101828] text-[24px] text-nowrap top-0 tracking-[0.0703px]">Hopterlink</p>
              </BackgroundImage3>
            </div>
          </div>
          <div className="h-[24px] relative shrink-0 w-[347.516px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[32px] items-center relative size-full">
              <div className="h-[24px] relative shrink-0 w-[62.102px]" data-name="Link">
                <BackgroundImageAndText2 text="Services" />
              </div>
              <div className="basis-0 grow h-[24px] min-h-px min-w-px relative shrink-0" data-name="Link">
                <BackgroundImageAndText2 text="How It Works" />
              </div>
              <div className="h-[24px] relative shrink-0 w-[43.648px]" data-name="Link">
                <BackgroundImageAndText2 text="About" />
              </div>
              <div className="h-[24px] relative shrink-0 w-[50.016px]" data-name="Link">
                <BackgroundImageAndText2 text="Pricing" />
              </div>
            </div>
          </div>
          <div className="h-[36px] relative shrink-0 w-[201.289px]" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative size-full">
              <div className="h-[36px] relative rounded-[8px] shrink-0 w-[76.953px]" data-name="Button">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                  <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#364153] text-[14px] text-center text-nowrap tracking-[-0.1504px]">Sign In</p>
                </div>
              </div>
              <div className="basis-0 bg-[#f7c876] grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
                <div className="flex flex-row items-center justify-center size-full">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[16px] py-[8px] relative size-full">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[14px] text-black text-center text-nowrap tracking-[-0.1504px]">Get Started</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-white h-[5345px] left-0 top-0 w-[1800px]" data-name="App">
        <div className="absolute h-[5281px] left-0 top-[64px] w-[1800px]" data-name="Main Content">
          <div className="absolute bg-[#efeff0] h-[855px] left-[260px] top-[749px] w-[1280px]" data-name="ServiceCategories">
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[84px] items-start left-[256px] top-[24px] w-[768px]" data-name="Container">
              <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 2">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[384.23px] not-italic text-[#101828] text-[36px] text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">Services for Every Need</p>
              </div>
              <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[384.62px] not-italic text-[#4a5565] text-[20px] text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%]">Browse our popular service categories and find the perfect professional for your task</p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[32px] top-[148px] w-[1216px]">
              <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 2">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Snow Clearing</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Fast snow removal for driveways and walkways</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d="M10 20L8.75 17.5L6 18" id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M10 4L8.75 6.5L6 6" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M14 20L15.25 17.5L18 18" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M14 4L15.25 6.5L18 6" id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M17 21L14 15H10" id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M17 3L14 9L15.5 12" id="Vector_6" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M2 12H8.5L10 9" id="Vector_7" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M20 10L18.5 12L20 14" id="Vector_8" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M22 12H15.5L14 15" id="Vector_9" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M4 10L5.5 12L4 14" id="Vector_10" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M7 21L10 15L8.5 12" id="Vector_11" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M7 3L10 9H14" id="Vector_12" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 3">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard1} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Landscaping</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Lawn mowing, trimming, and garden maintenance</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p4f79180} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.pca10000} id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 4">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard2} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Cleaning Services</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Professional home and office cleaning</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <BackgroundImage1>
                        <g clipPath="url(#clip0_53_1088)" id="Component 11">
                          <path d={svgPaths.p33697600} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                          <path d="M20 3V7" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                          <path d="M22 5H18" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                          <path d="M4 17V19" id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                          <path d="M5 18H3" id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        </g>
                        <defs>
                          <clipPath id="clip0_53_1088">
                            <rect fill="white" height="24" width="24" />
                          </clipPath>
                        </defs>
                      </BackgroundImage1>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 5">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard3} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Auto Services</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Mobile mechanics and car detailing</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p38e6dc00} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p298d6480} id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M9 17H15" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p29835400} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 6">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard4} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Handyman</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">General repairs and home improvements</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p3b66080} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[24px] items-center relative shrink-0 w-full">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 7">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard5} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Painting</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Interior and exterior painting services</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p4b9a900} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M18 15L22 11" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p4767200} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 8">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard6} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Personal Care</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Barbers and hair stylists</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p2b642900} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M8.12 8.12L12 12" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M20 4L8.12 15.88" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p4141780} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M14.8 14.8L20 20" id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 9">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard7} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Childcare</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Babysitting and nanny services</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d="M9 12H9.01" id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M15 12H15.01" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p656fc0} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p3610000} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 10">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard8} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Tutoring</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Home tutors for all subjects</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p12f29d00} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M22 10V16" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p2b645f80} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[224px]" data-name="Component 11">
                  <CardBackgroundImage>
                    <div className="absolute bg-white inset-0 rounded-tl-[10px] rounded-tr-[10px]" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[10px] rounded-tr-[10px] size-full" src={imgCard9} />
                  </CardBackgroundImage>
                  <div className="bg-white content-stretch flex flex-col gap-[4px] h-[107px] items-center justify-center relative rounded-bl-[10px] rounded-br-[10px] shrink-0 w-full">
                    <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27px] min-w-full not-italic relative shrink-0 text-[#101828] text-[18px] text-center tracking-[-0.4395px] w-[min-content]">Moving Help</p>
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#4a5565] text-[14px] text-center tracking-[-0.1504px] w-[min-content]">Pickup trucks and light moving assistance</p>
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[92px] rounded-[1.67772e+07px] size-[40px] top-[-20px]" data-name="ServiceCategories">
                      <ComponentBackgroundImage>
                        <path d={svgPaths.p67fd620} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d="M15 18H9" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p2beec100} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p13934880} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                        <path d={svgPaths.p1ff3c700} id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.66667" />
                      </ComponentBackgroundImage>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute h-[28px] left-[500.48px] top-[802px] w-[279.031px]" data-name="Button">
              <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-[140px] not-italic text-[#f1a400] text-[18px] text-center text-nowrap top-0 tracking-[-0.4395px] translate-x-[-50%]">View all 15+ service categories →</p>
            </div>
          </div>
          <IconBackgroundImage3 additionalClassNames="left-[80px] top-[762px]">
            <path d={svgPaths.pf770e00} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d="M135 112.5L165 82.5" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p1b556900} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
          <div className="absolute bg-white h-[818px] left-0 top-[1607px] w-[1800px]" data-name="HowItWorks">
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[84px] items-start left-[516px] top-[80px] w-[768px]" data-name="Container">
              <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 2">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[384.53px] not-italic text-[#101828] text-[36px] text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">How Hopterlink Works</p>
              </div>
              <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[383.86px] not-italic text-[#4a5565] text-[20px] text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%]">Simple, secure, and reliable for everyone</p>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[24px] h-[592px] items-start left-[388px] top-[212px]" data-name="Primitive.div">
              <div className="bg-[#ececf0] h-[60px] relative rounded-[14px] shrink-0 w-[1024px]" data-name="Tab List">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] pb-[-20.5px] pt-[3.5px] px-[3px] relative size-full">
                  <PrimitiveButtonBackgroundImageAndText text="For Clients" additionalClassNames="[grid-area:1_/_1] bg-white" />
                  <PrimitiveButtonBackgroundImageAndText text="For Service Providers" additionalClassNames="[grid-area:1_/_2]" />
                </div>
              </div>
              <div className="h-[515px] relative shrink-0 w-[1024px]" data-name="Tab Panel">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                  <div className="absolute gap-[32px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[234px] left-0 top-0 w-[1024px]" data-name="HowItWorks">
                    <div className="[grid-area:1_/_1] bg-white place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      <div className="absolute h-[232px] left-px top-px w-[318px]" data-name="CardContent">
                        <HowItWorksBackgroundImageAndText text="1" />
                        <HowItWorksBackgroundImage>{`Search & Discover`}</HowItWorksBackgroundImage>
                        <div className="absolute h-[72px] left-[24px] top-[136px] w-[270px]" data-name="HowItWorks">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[263px]">Browse service categories or search for specific providers. View ratings, availability, and pricing.</p>
                        </div>
                      </div>
                    </div>
                    <div className="[grid-area:1_/_2] bg-white place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      <div className="absolute h-[232px] left-px top-px w-[318px]" data-name="CardContent">
                        <HowItWorksBackgroundImageAndText text="2" />
                        <HowItWorksBackgroundImage>{`Request & Book`}</HowItWorksBackgroundImage>
                        <div className="absolute h-[72px] left-[24px] top-[136px] w-[270px]" data-name="HowItWorks">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[270px]">Describe your job and receive quotes from available providers. Choose the best fit and book instantly.</p>
                        </div>
                      </div>
                    </div>
                    <div className="[grid-area:1_/_3] bg-white place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      <div className="absolute h-[232px] left-px top-px w-[318px]" data-name="CardContent">
                        <HowItWorksBackgroundImageAndText text="3" />
                        <HowItWorksBackgroundImage>Pay Securely</HowItWorksBackgroundImage>
                        <div className="absolute h-[72px] left-[24px] top-[136px] w-[270px]" data-name="HowItWorks">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[264px]">Book your job and arrange payment directly with your provider. Flexible terms, fully on your schedule.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute gap-[32px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[234px] left-[176px] top-[266px] w-[672px]" data-name="HowItWorks">
                    <div className="[grid-area:1_/_1] bg-white place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      <div className="absolute h-[232px] left-px top-px w-[318px]" data-name="CardContent">
                        <HowItWorksBackgroundImageAndText text="4" />
                        <HowItWorksBackgroundImage>{`Rate & Review`}</HowItWorksBackgroundImage>
                        <div className="absolute h-[72px] left-[24px] top-[136px] w-[270px]" data-name="HowItWorks">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[255px]">Once the job is complete, rate your experience and help build a trusted community.</p>
                        </div>
                      </div>
                    </div>
                    <div className="[grid-area:1_/_2] bg-[rgba(247,200,118,0.3)] content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                      <div aria-hidden="true" className="absolute border border-[#c1c1c1] border-solid inset-0 pointer-events-none rounded-[14px]" />
                      <div className="h-[176px] relative shrink-0 w-[318px]" data-name="CardContent">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-0 pt-[24px] px-[24px] relative size-full">
                          <div className="h-[24px] relative shrink-0 w-full" data-name="HowItWorks">
                            <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#f9ac1e] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">✨ Bonus Rewards</p>
                          </div>
                          <div className="h-[48px] relative shrink-0 w-full" data-name="HowItWorks">
                            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[261px]">Earn 0.5% cashback on every $100 spent</p>
                          </div>
                          <div className="h-[40px] relative shrink-0 w-full" data-name="HowItWorks">
                            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[249px]">Use rewards for future bookings or fee waivers</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <IconBackgroundImage3 additionalClassNames="left-[80px] top-[735px]">
              <path d={svgPaths.p9a94e00} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M60.9 60.9L90 90" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M150 30L60.9 119.1" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d={svgPaths.p2cbc25f0} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M111 111L150 150" id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            </IconBackgroundImage3>
            <IconBackgroundImage3 additionalClassNames="left-[1540px] top-[711px]">
              <path d={svgPaths.p2c849100} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M150 22.5V52.5" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M165 37.5H135" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M30 127.5V142.5" id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M37.5 135H22.5" id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            </IconBackgroundImage3>
            <IconBackgroundImage3 additionalClassNames="left-[80px] top-[92px]">
              <path d={svgPaths.p7b2c980} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d="M112.5 135H67.5" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d={svgPaths.p108089a0} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d={svgPaths.p1b9d8130} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
              <path d={svgPaths.p2bf8ff00} id="Vector_5" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            </IconBackgroundImage3>
          </div>
          <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[#f9fafb] h-[962px] items-start left-0 pb-0 pt-[40px] px-[260px] to-[#ffffff] top-[2503px] w-[1800px]" data-name="Features">
            <div className="h-[882px] relative shrink-0 w-full" data-name="Container">
              <div className="absolute content-stretch flex flex-col gap-[16px] h-[84px] items-start left-[256px] top-0 w-[768px]" data-name="Container">
                <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 2">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[384.3px] not-italic text-[#101828] text-[36px] text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">{`Trust & Safety First`}</p>
                </div>
                <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[384.67px] not-italic text-[#4a5565] text-[20px] text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%]">{`We've built a platform that prioritizes security, transparency, and peace of mind`}</p>
                </div>
              </div>
              <div className="absolute gap-[32px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[488px] left-[32px] top-[148px] w-[1216px]" data-name="Container">
                <div className="[grid-area:1_/_1] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p1a3063b0} id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <div className="absolute h-[28px] left-[32px] top-[112px] w-[316px]" data-name="Features">
                      <div className="absolute h-[23.5px] left-0 top-[2px] w-[75.5px]" data-name="Text">
                        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#f1a400] text-[20px] top-[-2px] tracking-[-0.4492px] w-[76px]">Verified</p>
                      </div>
                      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-[75.5px] not-italic text-[#101828] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">Professionals</p>
                    </div>
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-0 tracking-[-0.3125px] w-[316px]">All service providers undergo background checks and credential verification</p>
                    </div>
                  </BackgroundImage3>
                </div>
                <div className="[grid-area:1_/_2] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p10ff480} id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p29789dc0} id="Vector_2" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <div className="absolute h-[28px] left-[32px] top-[112px] w-[316px]" data-name="Features">
                      <div className="absolute h-[23.5px] left-0 top-[2px] w-[69.109px]" data-name="Text">
                        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#f1a400] text-[20px] top-[-2px] tracking-[-0.4492px] w-[70px]">Secure</p>
                      </div>
                      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-[69.11px] not-italic text-[#101828] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">Flexible Payments</p>
                    </div>
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[121px]">Arrange payment</p>
                      <div className="absolute h-[19px] left-[120.05px] top-[2.5px] w-[75.063px]" data-name="Text">
                        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#f1a400] text-[16px] top-[-3px] tracking-[-0.3125px] w-[76px]">protected</p>
                      </div>
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[24px] tracking-[-0.3125px]">directly with your provider — flexible and transparent</p>
                    </div>
                  </BackgroundImage3>
                </div>
                <div className="[grid-area:1_/_3] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p1fa66600} id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d="M14 7V14L18.6667 16.3333" id="Vector_2" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <BackgroundImageAndText text="Real-Time Availability" additionalClassNames="left-[32px] top-[112px] w-[316px]" />
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[292px]">See provider schedules up to 2 weeks in advance and book instantly</p>
                    </div>
                  </BackgroundImage3>
                </div>
                <div className="[grid-area:2_/_1] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d="M14 2.33333V25.6667" id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p2a38c0} id="Vector_2" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <BackgroundImageAndText text="Transparent Pricing" additionalClassNames="left-[32px] top-[112px] w-[316px]" />
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[290px]">Providers set their own rates. No hidden fees or surprise charges</p>
                    </div>
                  </BackgroundImage3>
                </div>
                <div className="[grid-area:2_/_2] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p2d96ad00} id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p4cb2400} id="Vector_2" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <div className="absolute h-[28px] left-[32px] top-[112px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#101828] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">{`Ratings & Reviews`}</p>
                    </div>
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[220px]">Make informed decisions with</p>
                      <div className="absolute content-stretch flex h-[19px] items-start left-[222.45px] top-[-0.5px] w-[53.758px]" data-name="Text">
                        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#f1a400] text-[16px] text-nowrap tracking-[-0.3125px]">verified</p>
                      </div>
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] text-nowrap top-[23.5px] tracking-[-0.3125px]">reviews from real customers</p>
                    </div>
                  </BackgroundImage3>
                </div>
                <div className="[grid-area:2_/_3] bg-white content-stretch flex flex-col items-start p-[2px] place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                  <div aria-hidden="true" className="absolute border-2 border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                  <BackgroundImage3 additionalClassNames="w-[380px]">
                    <div className="absolute bg-[#2b2b2b] content-stretch flex items-center justify-center left-[32px] rounded-[10px] size-[56px] top-[32px]" data-name="Features">
                      <IconBackgroundImage4>
                        <path d={svgPaths.p184ba090} id="Vector" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p5d36b00} id="Vector_2" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p36197298} id="Vector_3" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                        <path d={svgPaths.p362f90c0} id="Vector_4" stroke="var(--stroke-0, #F1A400)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33333" />
                      </IconBackgroundImage4>
                    </div>
                    <BackgroundImageAndText text="Dispute Resolution" additionalClassNames="left-[32px] top-[112px] w-[316px]" />
                    <div className="absolute h-[48px] left-[32px] top-[152px] w-[316px]" data-name="Features">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#4a5565] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[266px]">Fair mediation process protects both clients and service providers</p>
                    </div>
                  </BackgroundImage3>
                </div>
              </div>
              <div className="absolute bg-[#fdefd6] content-stretch flex flex-col h-[158px] items-start left-[32px] pb-px pl-[33px] pr-px pt-[33px] rounded-[14px] top-[700px] w-[1216px]" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[#ffc9c9] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <div className="h-[92px] relative shrink-0" data-name="Features">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] h-full items-start relative">
                    <BackgroundImage5 additionalClassNames="bg-[#2b2b2b] rounded-[10px] size-[48px]">
                      <BackgroundImage1>
                        <g id="Icon">
                          <path d={svgPaths.p3f3d8e00} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </g>
                      </BackgroundImage1>
                    </BackgroundImage5>
                    <div className="h-[92px] relative shrink-0 w-[995px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                        <BackgroundImageAndText text="Insurance Coverage Options" additionalClassNames="left-0 top-0 w-[766px]" />
                        <div className="absolute h-[48px] left-0 top-[36px] w-[995px]" data-name="Paragraph">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#364153] text-[16px] top-0 tracking-[-0.3125px] w-[915px]">{`All service providers must carry their own insurance or opt-in to Hopterlink's optional coverage plan. Your projects are always`}</p>
                          <div className="absolute content-stretch flex h-[19px] items-start left-[915px] top-[-1px] w-[74.57px]" data-name="Text">
                            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#e70000] text-[16px] text-nowrap tracking-[-0.3125px]">protected</p>
                          </div>
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[989.24px] not-italic text-[#364153] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">.</p>
                        </div>
                        <div className="absolute h-[24px] left-0 top-[68px] w-[230.156px]" data-name="Button">
                          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[115px] not-italic text-[#f1a400] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Learn more about insurance →</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bg-[#f9fafb] h-[920px] left-1/2 top-[3449px] translate-x-[-50%] w-[1280px]" data-name="Testimonials">
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[84px] items-start left-[256px] top-[32px] w-[768px]" data-name="Container">
              <div className="h-[40px] relative shrink-0 w-full" data-name="Heading 2">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[384.08px] not-italic text-[#101828] text-[36px] text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">{`Loved by Clients & Providers`}</p>
              </div>
              <div className="h-[28px] relative shrink-0 w-full" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[384.72px] not-italic text-[#4a5565] text-[20px] text-center text-nowrap top-0 tracking-[-0.4492px] translate-x-[-50%]">Join thousands who trust Hopterlink for their service needs</p>
              </div>
            </div>
            <div className="absolute gap-[32px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[540px] left-[32px] top-[148px] w-[1216px]" data-name="Container">
              <div className="[grid-area:1_/_1] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <BackgroundImage6>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage />
                    ))}
                  </div>
                  <div className="h-[96px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[328px]">{`"Found a great landscaper in minutes! The availability scheduler made it so easy to book someone who could come the same day."`}</p>
                  </div>
                  <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (Sarah Johnson)" />
                    <div className="h-[44px] relative shrink-0 w-[112.633px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="Sarah Johnson" />
                        <ContainerBackgroundImageAndText1 text="Homeowner" />
                      </div>
                    </div>
                  </div>
                </BackgroundImage6>
              </div>
              <div className="[grid-area:1_/_2] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <CardContentBackgroundImage>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage1 />
                    ))}
                  </div>
                  <div className="h-[96px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[316px]">{`"Hopterlink has transformed my business. I get consistent bookings and the platform is reliable. Best platform for independent contractors."`}</p>
                  </div>
                  <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (Mike Rodriguez)" />
                    <div className="h-[44px] relative shrink-0 w-[126.938px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="Mike Rodriguez" />
                        <ContainerBackgroundImageAndText1 text="Handyman Provider" />
                      </div>
                    </div>
                  </div>
                </CardContentBackgroundImage>
              </div>
              <div className="[grid-area:1_/_3] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <CardContentBackgroundImage>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage2 />
                    ))}
                  </div>
                  <div className="h-[96px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[318px]">{`"I manage 12 properties and use Hopterlink for everything from cleaning to emergency repairs. The platform gives me peace of mind."`}</p>
                  </div>
                  <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (Emily Chen)" />
                    <div className="h-[44px] relative shrink-0 w-[116.242px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="Emily Chen" />
                        <ContainerBackgroundImageAndText1 text="Property Manager" />
                      </div>
                    </div>
                  </div>
                </CardContentBackgroundImage>
              </div>
              <div className="[grid-area:2_/_1] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <BackgroundImage6>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage />
                    ))}
                  </div>
                  <div className="h-[96px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[331px]">{`"The 2-week availability feature is a game changer. Clients can see exactly when I'm free, and I fill my schedule weeks in advance."`}</p>
                  </div>
                  <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (David Thompson)" />
                    <div className="h-[44px] relative shrink-0 w-[151.344px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="David Thompson" />
                        <ContainerBackgroundImageAndText1 text="Snow Removal Provider" />
                      </div>
                    </div>
                  </div>
                </BackgroundImage6>
              </div>
              <div className="[grid-area:2_/_2] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <CardContentBackgroundImage>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage1 />
                    ))}
                  </div>
                  <div className="h-[96px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[330px]">{`"As a cleaning service owner, Hopterlink helps me reach more customers without expensive advertising. The 3-5% commission is very fair."`}</p>
                  </div>
                  <div className="content-stretch flex gap-[44px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (Jessica Martinez)" />
                    <div className="h-[44px] relative shrink-0 w-[142.766px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="Jessica Martinez" />
                        <ContainerBackgroundImageAndText1 text="Small Business Owner" />
                      </div>
                    </div>
                  </div>
                </CardContentBackgroundImage>
              </div>
              <div className="[grid-area:2_/_3] bg-white content-stretch flex flex-col items-start p-px place-self-stretch relative rounded-[14px] shrink-0" data-name="Card">
                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[14px]" />
                <BackgroundImage6>
                  <div className="content-stretch flex gap-[4px] h-[20px] items-start relative shrink-0 w-full" data-name="Testimonials">
                    {[...Array(5).keys()].map((_, i) => (
                      <IconBackgroundImage2 />
                    ))}
                  </div>
                  <div className="h-[72px] relative shrink-0 w-full" data-name="Testimonials">
                    <p className="absolute font-['Inter:Italic',sans-serif] font-normal italic leading-[24px] left-0 text-[#364153] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[326px]">{`"Used the platform to find a mechanic for my car. Got three quotes within an hour and saved $200 compared to the dealership!"`}</p>
                  </div>
                  <div className="content-stretch flex gap-[77px] h-[48px] items-center relative shrink-0 w-full" data-name="Testimonials">
                    <div className="rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Image (Robert Lee)" />
                    <div className="h-[44px] relative shrink-0 w-[82.273px]" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <ContainerBackgroundImageAndText text="Robert Lee" />
                        <ContainerBackgroundImageAndText1 text="Homeowner" />
                      </div>
                    </div>
                  </div>
                </BackgroundImage6>
              </div>
            </div>
            <div className="absolute bg-white content-stretch flex flex-col h-[136px] items-start left-[32px] pb-0 pt-[32px] px-[32px] rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-[752px] w-[1216px]" data-name="Container">
              <div className="gap-[32px] grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[72px] relative shrink-0 w-full" data-name="Container">
                <div className="[grid-area:1_/_1] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
                  <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[132.2px] not-italic text-[36px] text-black text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">4.8/5</p>
                  </div>
                  <ContainerBackgroundImageAndText2 text="Average Rating" />
                </div>
                <div className="[grid-area:1_/_2] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
                  <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[132.31px] not-italic text-[36px] text-black text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">50K+</p>
                  </div>
                  <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[131.58px] not-italic text-[#ab7501] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Jobs Completed</p>
                  </div>
                </div>
                <div className="[grid-area:1_/_3] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
                  <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[131.8px] not-italic text-[36px] text-black text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">5K+</p>
                  </div>
                  <ContainerBackgroundImageAndText2 text="Active Providers" />
                </div>
                <div className="[grid-area:1_/_4] content-stretch flex flex-col gap-[8px] items-start place-self-stretch relative shrink-0" data-name="Container">
                  <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-[132px] not-italic text-[36px] text-black text-center text-nowrap top-[0.5px] tracking-[0.3691px] translate-x-[-50%]">98%</p>
                  </div>
                  <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[132.24px] not-italic text-[#ab7501] text-[16px] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <IconBackgroundImage3 additionalClassNames="left-[80px] top-[4137px]">
            <path d="M67.5 90H67.575" id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d="M112.5 90H112.575" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p96c4400} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.pd3f6f80} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
          <div className="absolute content-stretch flex flex-col h-[448px] items-start left-0 pb-0 pt-[80px] px-[452px] top-[4457px] w-[1800px]" data-name="CTA" style={{ backgroundImage: "linear-gradient(166.024deg, rgba(247, 200, 118, 0.7) 0%, rgb(241, 164, 0) 50%, rgba(241, 164, 0, 0.7) 100%)" }}>
            <div className="h-[288px] relative shrink-0 w-full" data-name="Container">
              <div className="absolute h-[48px] left-0 top-0 w-[896px]" data-name="Heading 2">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[48px] left-[448.03px] not-italic text-[48px] text-black text-center text-nowrap top-[0.5px] tracking-[0.3516px] translate-x-[-50%]">Ready to Get Started?</p>
              </div>
              <div className="absolute h-[56px] left-[112px] top-[72px] w-[672px]" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-[336.39px] not-italic text-[20px] text-[rgba(74,85,101,0.9)] text-center top-0 tracking-[-0.4492px] translate-x-[-50%] w-[670px]">Join thousands of happy clients and service providers. Sign up today and get your first job posted or booked in minutes.</p>
              </div>
              <div className="absolute content-stretch flex gap-[16px] h-[60px] items-start justify-center left-0 pl-0 pr-[0.008px] py-0 top-[168px] w-[896px]" data-name="Container">
                <div className="bg-white h-[56px] relative rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-[252.383px]" data-name="Button">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                    <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[110.5px] not-italic text-[18px] text-black text-center text-nowrap top-[14px] tracking-[-0.4395px] translate-x-[-50%]">Find a Service Provider</p>
                    <IconBackgroundImage5 additionalClassNames="left-[220.38px] top-[20px]">
                      <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      <path d={svgPaths.p1d405500} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    </IconBackgroundImage5>
                  </div>
                </div>
                <div className="h-[60px] relative rounded-[14px] shrink-0 w-[301.797px]" data-name="Button">
                  <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[14px]" />
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[42px] py-[30px] relative size-full">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-center text-nowrap text-white tracking-[-0.4395px]">Start Earning as a Provider</p>
                  </div>
                </div>
              </div>
              <div className="absolute h-[28px] left-0 top-[260px] w-[896px]" data-name="Container">
                <div className="absolute content-stretch flex gap-[8px] h-[28px] items-center left-[168.06px] top-0 w-[193.297px]" data-name="Container">
                  <TextBackgroundImageAndText text="✓" />
                  <BackgroundImage3 additionalClassNames="h-[24px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[84.5px] not-italic text-[16px] text-[rgba(0,0,0,0.9)] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">No credit card required</p>
                  </BackgroundImage3>
                </div>
                <div className="absolute content-stretch flex gap-[8px] h-[28px] items-center left-[393.36px] top-0 w-[165.547px]" data-name="Container">
                  <TextBackgroundImageAndText text="✓" />
                  <BackgroundImage3 additionalClassNames="h-[24px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[70.5px] not-italic text-[16px] text-[rgba(0,0,0,0.9)] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Free account setup</p>
                  </BackgroundImage3>
                </div>
                <div className="absolute content-stretch flex gap-[8px] h-[28px] items-center left-[590.91px] top-0 w-[137.023px]" data-name="Container">
                  <TextBackgroundImageAndText text="✓" />
                  <BackgroundImage3 additionalClassNames="h-[24px]">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[56.5px] not-italic text-[16px] text-[rgba(0,0,0,0.9)] text-center text-nowrap top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%]">Cancel anytime</p>
                  </BackgroundImage3>
                </div>
              </div>
            </div>
            <div className="absolute h-[566.606px] left-[1209px] top-[-118.19px] w-[393px]" data-name="plumber-pointing-lateral 1">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPlumberPointingLateral1} />
            </div>
          </div>
          <div className="absolute bg-[#f7c876] h-[701px] left-0 overflow-clip top-0 w-[1800px]" data-name="Hero">
            <div className="absolute h-[829px] left-0 opacity-10 top-0 w-[1800px]" data-name="Container" />
            <div className="absolute h-[573px] left-[292px] top-[64px] w-[1216px]" data-name="Container">
              <div className="absolute h-[573px] left-0 top-0 w-[584px]" data-name="Container">
                <div className="absolute bg-[#2b2b2b] h-[40px] left-0 rounded-[1.67772e+07px] top-0 w-[213px]" data-name="Container">
                  <div className="absolute content-stretch flex h-[16.5px] items-start left-[12px] top-[11.5px]" data-name="Text">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#f7c876] text-[14px] text-nowrap tracking-[-0.1504px]">Trusted Service Marketplace</p>
                  </div>
                </div>
                <div className="absolute h-[225px] left-0 top-[72px] w-[584px]" data-name="Heading 1">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[75px] left-0 not-italic text-[60px] text-black top-px tracking-[0.2637px] w-[527px]">Connect with Local Service Pros in Minutes</p>
                </div>
                <div className="absolute h-[56px] left-0 top-[329px] w-[576px]" data-name="Paragraph">
                  <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[20px] text-[rgba(0,0,0,0.9)] top-0 tracking-[-0.4492px] w-[553px]">From handymen to landscapers, find verified professionals near you. Fast, reliable, and secure.</p>
                </div>
                <div className="absolute content-stretch flex gap-[16px] h-[52px] items-start left-0 top-[417px] w-[584px]" data-name="Container">
                  <div className="bg-black h-[48px] relative rounded-[14px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0 w-[213px]" data-name="Button">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[90px] not-italic text-[18px] text-center text-nowrap text-white top-[10px] tracking-[-0.4395px] translate-x-[-50%]">I Need a Service</p>
                      <IconBackgroundImage5 additionalClassNames="left-[172.82px] top-[16px]">
                        <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                        <path d={svgPaths.p1d405500} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                      </IconBackgroundImage5>
                    </div>
                  </div>
                  <div className="h-[52px] relative rounded-[14px] shrink-0 w-[222.375px]" data-name="Button">
                    <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[14px]" />
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[34px] py-[26px] relative size-full">
                      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[18px] text-black text-center text-nowrap tracking-[-0.4395px]">Become a Provider</p>
                    </div>
                  </div>
                </div>
                <div className="absolute content-stretch flex gap-[32px] h-[72px] items-center left-0 top-[501px] w-[584px]" data-name="Container">
                  <div className="h-[56px] relative shrink-0 w-[106.188px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                      <ContainerBackgroundImageAndText3 text="5,000+" />
                      <ContainerBackgroundImageAndText4 text="Active Providers" />
                    </div>
                  </div>
                  <Container />
                  <div className="h-[56px] relative shrink-0 w-[125.672px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                      <ContainerBackgroundImageAndText3 text="50,000+" />
                      <ContainerBackgroundImageAndText4 text="Jobs Completed" />
                    </div>
                  </div>
                  <Container />
                  <div className="h-[56px] relative shrink-0 w-[97.328px]" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                      <div className="content-stretch flex h-[36px] items-start relative shrink-0 w-full" data-name="Container">
                        <p className="basis-0 font-['Inter:Bold',sans-serif] font-bold grow leading-[36px] min-h-px min-w-px not-italic relative shrink-0 text-[30px] text-black tracking-[0.3955px]">4.8★</p>
                      </div>
                      <ContainerBackgroundImageAndText4 text="Average Rating" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bg-[rgba(255,255,255,0)] h-[500px] left-[632px] overflow-clip rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-[36.5px] w-[584px]" data-name="Container">
                <div className="absolute h-[500px] left-0 top-0 w-[584px]" data-name="Image (Professional handyman with tools)">
                  <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div className="absolute bg-black inset-0" />
                    <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={imgImageProfessionalHandymanWithTools} />
                  </div>
                </div>
                <div className="absolute bg-black content-stretch flex flex-col h-[80px] items-start left-[332.12px] pb-0 pt-[16px] px-[16px] rounded-[14px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] top-[396px] w-[227.883px]" data-name="Container">
                  <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
                    <BackgroundImage5 additionalClassNames="bg-[#00c950] rounded-[1.67772e+07px] size-[48px]">
                      <BackgroundImage4 additionalClassNames="w-[16.875px]">
                        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[20px] text-nowrap text-white top-0 tracking-[-0.4492px]">✓</p>
                      </BackgroundImage4>
                    </BackgroundImage5>
                    <div className="basis-0 grow h-[44px] min-h-px min-w-px relative shrink-0" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
                          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[16px] text-nowrap text-white top-[-0.5px] tracking-[-0.3125px]">Verified Provider</p>
                        </div>
                        <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
                          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#b9b9b9] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Background checked</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <IconBackgroundImage3 additionalClassNames="left-[1569px] top-[1483px]">
            <path d={svgPaths.p3282a780} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p21f3ca00} id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
          <IconBackgroundImage3 additionalClassNames="left-[1540px] top-[789px]">
            <path d={svgPaths.p24e41700} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
          <IconBackgroundImage3 additionalClassNames="left-[1540px] top-[3219px]">
            <path d={svgPaths.p1e49b780} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p310f99c0} id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d="M67.5 127.5H112.5" id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p9575280} id="Vector_4" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
          <IconBackgroundImage3 additionalClassNames="left-[80px] top-[3153px]">
            <path d={svgPaths.p3b947000} id="Vector" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d="M165 75V120" id="Vector_2" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
            <path d={svgPaths.p3d4d2300} id="Vector_3" stroke="var(--stroke-0, #F7C876)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="2.66667" />
          </IconBackgroundImage3>
        </div>
        <div className="absolute bg-[#101828] content-stretch flex flex-col gap-[32px] h-[376px] items-start left-0 pb-0 pt-[48px] px-[32px] top-[4969px] w-[1800px]" data-name="Footer">
          <div className="h-[195px] relative shrink-0 w-full" data-name="Container">
            <div className="absolute h-[195px] left-0 top-0 w-[467.195px]" data-name="Container">
              <div className="absolute content-stretch flex gap-[8px] h-[40px] items-center left-0 top-0 w-[467.195px]" data-name="Container">
                <BackgroundImage5 additionalClassNames="bg-[#f1a400] rounded-[10px] size-[40px]">
                  <BackgroundImage4 additionalClassNames="w-[26.234px]">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#101828] text-[20px] text-nowrap top-0 tracking-[-0.4492px]">FH</p>
                  </BackgroundImage4>
                </BackgroundImage5>
                <div className="h-[32px] relative shrink-0 w-[122.398px]" data-name="Text">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                    <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-0 not-italic text-[24px] text-nowrap text-white top-0 tracking-[0.0703px]">Hopterlink</p>
                  </div>
                </div>
              </div>
              <div className="absolute h-[48px] left-0 top-[56px] w-[384px]" data-name="Paragraph">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#99a1af] text-[16px] top-[-0.5px] tracking-[-0.3125px] w-[345px]">Connecting clients with trusted local service providers across Canada and the United States.</p>
              </div>
              <div className="absolute content-stretch flex gap-[16px] h-[40px] items-start left-0 top-[144px] w-[467.195px]" data-name="Container">
                <BackgroundImage5 additionalClassNames="bg-[#1e2939] rounded-[1.67772e+07px] size-[40px]">
                  <BackgroundImage>
                    <path d={svgPaths.p30c8d680} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </BackgroundImage>
                </BackgroundImage5>
                <BackgroundImage5 additionalClassNames="bg-[#1e2939] rounded-[1.67772e+07px] size-[40px]">
                  <BackgroundImage>
                    <path d={svgPaths.p188b5880} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </BackgroundImage>
                </BackgroundImage5>
                <BackgroundImage5 additionalClassNames="bg-[#1e2939] rounded-[1.67772e+07px] size-[40px]">
                  <BackgroundImage2>
                    <g clipPath="url(#clip0_53_935)" id="Icon">
                      <path d={svgPaths.p4b98700} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d={svgPaths.p3af2c300} id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                      <path d="M14.5833 5.41667H14.5917" id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    </g>
                    <defs>
                      <clipPath id="clip0_53_935">
                        <rect fill="white" height="20" width="20" />
                      </clipPath>
                    </defs>
                  </BackgroundImage2>
                </BackgroundImage5>
                <BackgroundImage5 additionalClassNames="bg-[#1e2939] rounded-[1.67772e+07px] size-[40px]">
                  <BackgroundImage>
                    <path d={svgPaths.p1bcdee00} id="Vector" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d="M5 7.5H1.66667V17.5H5V7.5Z" id="Vector_2" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                    <path d={svgPaths.p25677470} id="Vector_3" stroke="var(--stroke-0, #D1D5DC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
                  </BackgroundImage>
                </BackgroundImage5>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[195px] items-start left-[499.2px] top-0 w-[217.602px]" data-name="Container">
              <HeadingBackgroundImageAndText text="For Clients" />
              <div className="content-stretch flex flex-col gap-[8px] h-[152px] items-start relative shrink-0 w-full" data-name="List">
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Browse Services" additionalClassNames="w-[119.602px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="How It Works" additionalClassNames="w-[95.75px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Pricing" additionalClassNames="w-[50.016px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <div className="absolute content-stretch flex h-[19px] items-start left-0 top-[2.5px] w-[102.617px]" data-name="Link">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[24px] not-italic relative shrink-0 text-[#d1d5dc] text-[16px] text-nowrap tracking-[-0.3125px]">{`Safety & Trust`}</p>
                  </div>
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Client FAQ" additionalClassNames="w-[76.305px]" />
                </div>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[195px] items-start left-[748.8px] top-0 w-[217.602px]" data-name="Container">
              <HeadingBackgroundImageAndText text="For Providers" />
              <div className="content-stretch flex flex-col gap-[8px] h-[152px] items-start relative shrink-0 w-full" data-name="List">
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Become a Provider" additionalClassNames="w-[136.492px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Provider Benefits" additionalClassNames="w-[123.945px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Commission Structure" additionalClassNames="w-[160.984px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Insurance Options" additionalClassNames="w-[131.906px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Provider FAQ" additionalClassNames="w-[94.789px]" />
                </div>
              </div>
            </div>
            <div className="absolute content-stretch flex flex-col gap-[16px] h-[195px] items-start left-[998.4px] top-0 w-[217.602px]" data-name="Container">
              <HeadingBackgroundImageAndText text="Company" />
              <div className="content-stretch flex flex-col gap-[8px] h-[152px] items-start relative shrink-0 w-full" data-name="List">
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="About Us" additionalClassNames="w-[67.383px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Careers" additionalClassNames="w-[56.547px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Press" additionalClassNames="w-[40.195px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Blog" additionalClassNames="w-[32.516px]" />
                </div>
                <div className="h-[24px] relative shrink-0 w-full" data-name="List Item">
                  <LinkBackgroundImageAndText text="Contact" additionalClassNames="w-[57.617px]" />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex h-[53px] items-center justify-between pb-0 pt-px px-0 relative shrink-0 w-full" data-name="Container">
            <div aria-hidden="true" className="absolute border-[#1e2939] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
            <div className="h-[20px] relative shrink-0 w-[276.32px]" data-name="Paragraph">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#99a1af] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">© 2024 Hopterlink Inc. All rights reserved.</p>
              </div>
            </div>
            <div className="h-[20px] relative shrink-0 w-[332.891px]" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-start relative size-full">
                <div className="h-[20px] relative shrink-0 w-[89.391px]" data-name="Link">
                  <BackgroundImageAndText1 text="Privacy Policy" />
                </div>
                <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Link">
                  <BackgroundImageAndText1 text="Terms of Service" />
                </div>
                <div className="h-[20px] relative shrink-0 w-[87.008px]" data-name="Link">
                  <BackgroundImageAndText1 text="Cookie Policy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}