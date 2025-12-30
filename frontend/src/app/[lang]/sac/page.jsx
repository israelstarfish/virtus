// frontend/src/app/[lang]/pricing/page.jsx

"use client";

import Header from "../../../components/Recycles/Header";
import { messages } from "../messages/sac";
import { useParams } from "next/navigation";
import '../../styles/virtus.css';

export default function SacPage() {
    const { lang } = useParams();
    const t = messages[lang] || messages["pt-br"];

    return (
        <>
            <Header />
            <section className="container space-y-18 py-16">
                <section className="grid grid-cols-2 gap-4" id="sac">
                    {/* Discord */}
                    <div className="col-span-2 flex flex-col gap-6 rounded-md bg-linear-to-b bg-virtus-800 from-[#5562EA]/15 via-[#5562EA]/[0.0875] to-background p-4">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        alt="Discord's Logo"
                                        loading="lazy"
                                        width="32"
                                        height="32"
                                        decoding="async"
                                        style={{ color: "transparent" }}
                                        src="/assets/companies/small/discord.svg"
                                    />
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg text-primary">{t.discord.title}</h1>
                                    <p className="hidden text-gray-500 sm:block">{t.discord.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 self-end">
                                <a
                                    target="_blank"
                                    role="button"
                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
                                    href="https://go.virtuscloud.app/discord"
                                >
                                    {t.discord.button}
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Consultoria Técnica */}
                            <div className="flex items-start gap-2">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-virtus-800/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-secondary">
                                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM88,160a8,8,0,1,1-8,8A8,8,0,0,1,88,160ZM48,48H80v97.38a24,24,0,1,0,16,0V115.31l48,48V208H48ZM208,208H160V160a8,8,0,0,0-2.34-5.66L96,92.69V48h32V72a8,8,0,0,0,2.34,5.66l16,16A23.74,23.74,0,0,0,144,104a24,24,0,1,0,24-24,23.74,23.74,0,0,0-10.34,2.35L144,68.69V48h64V208ZM168,96a8,8,0,1,1-8,8A8,8,0,0,1,168,96Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="my-0 font-semibold text-sm">{t.resources.consulting}</p>
                                    <span className="text-secondary text-sm">{t.resources.consultingDesc}</span>
                                </div>
                            </div>

                            {/* Eventos Mensais */}
                            <div className="flex items-start gap-2">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-virtus-800/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-secondary">
                                        <path d="M232,112a24,24,0,0,0-24-24H136V79a32.06,32.06,0,0,0,24-31c0-28-26.44-45.91-27.56-46.66a8,8,0,0,0-8.88,0C122.44,2.09,96,20,96,48a32.06,32.06,0,0,0,24,31v9H48a24,24,0,0,0-24,24v23.33a40.84,40.84,0,0,0,8,24.24V200a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V159.57a40.84,40.84,0,0,0,8-24.24Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="my-0 font-semibold text-sm">{t.resources.events}</p>
                                    <span className="text-secondary text-sm">{t.resources.eventsDesc}</span>
                                </div>
                            </div>

                            {/* Comunicação Direta */}
                            <div className="flex items-start gap-2">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-virtus-800/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-secondary">
                                        <path d="M220.17,100,202.86,70a28,28,0,0,0-38.24-10.25,27.69,27.69,0,0,0-9,8.34L138.2,38a28,28,0,0,0-48.48,0A28,28,0,0,0,48.15,74l1.59,2.76A27.67,27.67,0,0,0,38,80.41a28,28,0,0,0-10.24,38.25l40,69.32a87.47,87.47,0,0,0,53.43,41,88.56,88.56,0,0,0,22.92,3,88,88,0,0,0,76.06-132Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="my-0 font-semibold text-sm">{t.resources.direct}</p>
                                    <span className="text-secondary text-sm">{t.resources.directDesc}</span>
                                </div>
                            </div>

                            {/* Comunidade de desenvolvedores */}
                            <div className="flex items-start gap-2">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-virtus-800/50">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        fill="currentColor"
                                        viewBox="0 0 256 256"
                                        className="text-secondary"
                                    >
                                        <path d="M232,56H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V72A16,16,0,0,0,232,56Zm0,128H24V72H232V184ZM128,104v16h8a8,8,0,0,1,0,16h-8v16h16a8,8,0,0,1,0,16H120a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16Zm87.7-5.83-18,64a8,8,0,0,1-15.4,0l-18-64a8,8,0,0,1,15.4-4.34L190,130.45l10.3-36.62a8,8,0,1,1,15.4,4.34ZM64,88H56a8,8,0,0,0-8,8v64a8,8,0,0,0,8,8h8a32,32,0,0,0,32-32V120A32,32,0,0,0,64,88Zm16,48a16,16,0,0,1-16,16V104a16,16,0,0,1,16,16Z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="my-0 font-semibold text-sm">{t.resources.community}</p>
                                    <span className="text-secondary text-sm">{t.resources.communityDesc}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Chat */}
                    <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                    className="mt-px shrink-0 self-start"
                                >
                                    <path d="M232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Z" />
                                </svg>
                                <div>
                                    <h1 className="font-bold text-lg text-primary">{t.chat.title}</h1>
                                    <p className="hidden text-gray-500 sm:block">{t.chat.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 self-end">
                                <div className="flex items-center gap-1.5 rounded-full px-2 py-px bg-red-700">
                                    <span className="size-2 rounded-full bg-white"></span>
                                    <span className="font-medium text-sm text-white">{t.chat.status}</span>
                                </div>
                                <button
                                    type="button"
                                    role="button"
                                    className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-12 text-base px-3"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 256 256"
                                    >
                                        <path d="M240,127.89a16,16,0,0,1-8.18,14L63.9,237.9A16.15,16.15,0,0,1,56,240a16,16,0,0,1-15-21.33l27-79.95A4,4,0,0,1,71.72,136H144a8,8,0,0,0,8-8.53,8.19,8.19,0,0,0-8.26-7.47h-72a4,4,0,0,1-3.79-2.72l-27-79.94A16,16,0,0,1,63.84,18.07l168,95.89A16,16,0,0,1,240,127.89Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="font-medium">
                                {t.chat.hours}
                                <span className="ml-2 w-fit rounded-md border border-border bg-virtus-900 px-1.5 py-px font-medium text-secondary text-sm">
                                    {t.chat.timezone}
                                </span>
                            </h3>
                            <div className="text-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="w-fit rounded-full bg-blue-900 px-1.5 py-px font-medium">{t.chat.weekdays}</p>
                                    <p className="text-secondary">
                                        {t.chat.schedule}
                                        <span className="ml-1.5 text-muted text-xs">{t.chat.lunch}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Whatsapp */}
                    <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4 md:col-span-1">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div>
                                <h1 className="font-bold text-lg text-primary">{t.whatsapp.title}</h1>
                                <p className="text-gray-500 text-sm">{t.whatsapp.description}</p>
                            </div>
                            <button
                                type="button"
                                role="button"
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-12 text-base bg-green-600/20 px-3 text-green-600 hover:bg-green-600/30"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                >
                                    <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Telegram */}
                    <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4 md:col-span-1">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div>
                                <h1 className="font-bold text-lg text-primary">{t.telegram.title}</h1>
                                <p className="text-gray-500 text-sm">{t.telegram.description}</p>
                            </div>
                            <button
                                type="button"
                                role="button"
                                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium outline-none transition-all hover:cursor-pointer disabled:pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus:outline-hidden focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-blue-700 h-12 text-base bg-sky-600/20 px-3 text-sky-600 hover:bg-sky-600/30"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                >
                                    <path d="M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Zm-61.14,36L78.15,126.35l-49.6-9.73ZM88,200V152.52l24.79,21.74Zm87.53,8L92.85,135.5l119-85.29Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* E-mail */}
                    <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div>
                                <h1 className="font-bold text-lg text-primary">{t.email.title}</h1>
                                <p className="text-gray-500 text-sm">
                                    {t.email.description}
                                    <span className="ml-1 select-all items-end font-medium">{t.email.address}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        fill="currentColor"
                                        viewBox="0 0 256 256"
                                        className="ml-1 hidden sm:inline"
                                    >
                                        <path d="M88,24V16a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0ZM16,104h8a8,8,0,0,0,0-16H16a8,8,0,0,0,0,16ZM124.42,39.16a8,8,0,0,0,10.74-3.58l8-16a8,8,0,0,0-14.31-7.16l-8,16A8,8,0,0,0,124.42,39.16Zm-96,81.69-16,8a8,8,0,0,0,7.16,14.31l16-8a8,8,0,1,0-7.16-14.31ZM219.31,184a16,16,0,0,1,0,22.63l-12.68,12.68a16,16,0,0,1-22.63,0L132.7,168,115,214.09c0,.1-.08.21-.13.32a15.83,15.83,0,0,1-14.6,9.59l-.79,0a15.83,15.83,0,0,1-14.41-11L32.8,52.92A16,16,0,0,1,52.92,32.8L213,85.07a16,16,0,0,1,1.41,29.8l-.32.13L168,132.69ZM208,195.31,156.69,144h0a16,16,0,0,1,4.93-26l.32-.14,45.95-17.64L48,48l52.2,159.86,17.65-46c0-.11.08-.22.13-.33a16,16,0,0,1,11.69-9.34,16.72,16.72,0,0,1,3-.28,16,16,0,0,1,11.3,4.69L195.31,208Z" />
                                    </svg>
                                    <span className="-ml-1 inline sm:hidden">.</span>
                                </p>
                            </div>
                            <a
                                className="flex size-fit items-center gap-1 self-end rounded-md bg-orange-600/20 p-3 text-orange-600 transition-colors hover:bg-orange-600/30 sm:self-center"
                                target="_blank"
                                href={`mailto:${t.email.address}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 256 256"
                                >
                                    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
            </section>
        </>
    );
}

//import Header from "../../../components/Header";
//
//export default function SacPage() {
//  return (
//    <>
//      <Header />
//      <section className="container space-y-18 py-16">
//        <section className="grid grid-cols-2 gap-4" id="sac">
//          {/* Discord */}
//          <div className="col-span-2 flex flex-col gap-6 rounded-md bg-linear-to-b bg-virtus-800 from-[#5562EA]/15 via-[#5562EA]/[0.0875] to-background p-4">
//            <div className="flex w-full items-center justify-between gap-4">
//              <div className="flex items-center gap-4">
//                <div className="relative">
//                  <img
//                    alt="Discord's Logo"
//                    loading="lazy"
//                    width="32"
//                    height="32"
//                    decoding="async"
//                    style={{ color: "transparent" }}
//                    src="/assets/companies/small/discord.svg"
//                  />
//                </div>
//                <div>
//                  <h1 className="font-bold text-lg text-primary">Discord</h1>
//                  <p className="hidden text-gray-500 sm:block">
//                    Junte-se à comunidade Virtus Cloud no Discord e obtenha suporte e insights valiosos.
//                  </p>
//                </div>
//              </div>
//              <div className="flex items-center gap-4 self-end">
//                <a
//                  target="_blank"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-primary text-sm outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-10 px-4"
//                  href="https://go.virtuscloud.app/discord"
//                >
//                  Junte-se à comunidade
//                </a>
//              </div>
//            </div>
//
//            {/* Recursos */}
//            <div className="grid gap-6 md:grid-cols-2">
//              {[
//                {
//                  title: "Consultoria Técnica",
//                  description:
//                    "Receba orientações especializadas e soluções para melhorar o desempenho técnico do seu negócio.",
//                },
//                {
//                  title: "Eventos Mensais",
//                  description:
//                    "Participe de sorteios exclusivos e eventos mensais no Discord.",
//                },
//                {
//                  title: "Comunicação Direta",
//                  description:
//                    "Conecte-se diretamente com toda a equipe da Virtus Cloud para obter assistência personalizada.",
//                },
//                {
//                  title: "Comunidade de desenvolvedores",
//                  description:
//                    "Conecte-se com outros desenvolvedores e descubra novas oportunidades na sua área.",
//                },
//              ].map((item, index) => (
//                <div key={index} className="flex items-start gap-2">
//                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-border bg-virtus-800/50">
//                    {/* Ícone genérico */}
//                    <svg
//                      xmlns="http://www.w3.org/2000/svg"
//                      width="18"
//                      height="18"
//                      fill="currentColor"
//                      viewBox="0 0 256 256"
//                      className="text-secondary"
//                    >
//                      <path d="..." />
//                    </svg>
//                  </div>
//                  <div className="flex flex-col justify-center">
//                    <p className="my-0 font-semibold text-sm">{item.title}</p>
//                    <span className="text-secondary text-sm">{item.description}</span>
//                  </div>
//                </div>
//              ))}
//            </div>
//          </div>
//
//          {/* Chat */}
//          <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4">
//            <div className="flex w-full items-center justify-between gap-4">
//              <div className="flex gap-4">
//                <svg
//                  xmlns="http://www.w3.org/2000/svg"
//                  width="24"
//                  height="24"
//                  fill="currentColor"
//                  viewBox="0 0 256 256"
//                  className="mt-px shrink-0 self-start"
//                >
//                  <path d="..." />
//                </svg>
//                <div>
//                  <h1 className="font-bold text-lg text-primary">Chat</h1>
//                  <p className="hidden text-gray-500 sm:block">
//                    Converse com um agente de suporte em tempo real.
//                  </p>
//                </div>
//              </div>
//              <div className="flex items-center gap-4 self-end">
//                <div className="flex items-center gap-1.5 rounded-full px-2 py-px bg-red-700">
//                  <span className="size-2 rounded-full bg-white"></span>
//                  <span className="font-medium text-sm text-white">Offline</span>
//                </div>
//                <button
//                  type="button"
//                  role="button"
//                  className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-700 h-12 text-base px-3"
//                >
//                  {/* Ícone de envio */}
//                  <svg
//                    xmlns="http://www.w3.org/2000/svg"
//                    width="24"
//                    height="24"
//                    fill="currentColor"
//                    viewBox="0 0 256 256"
//                  >
//                    <path d="..." />
//                  </svg>
//                </button>
//              </div>
//            </div>
//            <div className="flex flex-col gap-2">
//              <h3 className="font-medium">
//                Horário de atendimento
//                <span className="ml-2 w-fit rounded-md border border-border bg-virtus-900 px-1.5 py-px font-medium text-secondary text-sm">
//                  UTC-3
//                </span>
//              </h3>
//              <div className="text-sm">
//                <div className="flex flex-wrap items-center gap-2">
//                  <p className="w-fit rounded-full bg-blue-900 px-1.5 py-px font-medium">
//                    Segunda à sexta
//                  </p>
//                  <p className="text-secondary">
//                    10:00 - 20:00
//                    <span className="ml-1.5 text-muted text-xs">
//                      (Intervalo para o almoço das 12:00 às 13:00)
//                    </span>
//                  </p>
//                </div>
//              </div>
//            </div>
//          </div>
//
//          {/* Whatsapp */}
//          <div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4 md:col-span-1">
//            <div className="flex w-full items-center justify-between gap-4">
//              <div>
//                <h1 className="font-bold text-lg text-primary">Whatsapp</h1>
//                <p className="text-gray-500 text-sm">
//                  Entre em contato conosco através do Whatsapp.
//                </p>
//              </div>
//              <button
//                type="button"
//                role="button"
//                className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 h-12 text-base bg-green-600/20 px-3 text-green-600 hover:bg-green-600/30"
//              >
//                <svg
//                  xmlns="http://www.w3.org/2000/svg"
//                  width="24"
//                  height="24"
//                  fill="currentColor"
//                  viewBox="0 0 256 256"
//                >
//                  <path d="..." />
//                </svg>
//              </button>
//            </div>
//          </div>
//
//          {/* Telegram */}
//<div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4 md:col-span-1">
//  <div className="flex w-full items-center justify-between gap-4">
//    <div>
//      <h1 className="font-bold text-lg text-primary">Telegram</h1>
//      <p className="text-gray-500 text-sm">Envie-nos uma mensagem no Telegram.</p>
//    </div>
//    <button
//      type="button"
//      role="button"
//      className="group/button relative inline-flex min-w-fit shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium outline-none transition-all hover:cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-blue-700 h-12 text-base bg-sky-600/20 px-3 text-sky-600 hover:bg-sky-600/30"
//    >
//      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//        <path d="M228.88,26.19a9,9,0,0,0-9.16-1.57L17.06,103.93a14.22,14.22,0,0,0,2.43,27.21L72,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L165,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L231.77,35A9,9,0,0,0,228.88,26.19Z" />
//      </svg>
//    </button>
//  </div>
//</div>
//
//{/* E-mail */}
//<div className="col-span-2 flex flex-col gap-4 rounded-md border-2 border-virtus-700 bg-virtus-800 p-4">
//  <div className="flex w-full items-center justify-between gap-4">
//    <div>
//      <h1 className="font-bold text-lg text-primary">E-mail</h1>
//      <p className="text-gray-500 text-sm">
//        Envie um email para
//        <span className="ml-1 select-all font-medium">support@virtuscloud.app</span>
//      </p>
//    </div>
//    <a
//      className="flex size-fit items-center gap-1 self-end rounded-md bg-orange-600/20 p-3 text-orange-600 transition-colors hover:bg-orange-600/30 sm:self-center"
//      target="_blank"
//      href="mailto:support@virtuscloud.app"
//    >
//      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
//        <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
//      </svg>
//    </a>
//  </div>
//</div>
//      </section>
//    </section>
//  </>
//);
//}