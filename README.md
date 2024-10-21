# roadone30

## This project has been archived
This project is archived, since it does not fit modern standards anymore and has been unnecessarily hard to maintain. Over time, a clearer vision from the client's Point Of View and from a development standpoint emerged. A new version, more approprately fitting roadone's needs, is to be made. Tho, it still represents that I have gathered experience building responsive and complex websites and thus the repository has been made public.

## What would be different in a revamped version

### Techstack
| Previous | New | Reasoning |
| :------------------- | :-------------- | :--------- |
| NextJS 12 | **NextJS 14** | NextJS now provides the app router instead of the old pages, making development easier and future-proof |
| MySQL/Prisma | **Supabase** | A Backend-as-a-Service will accelerate the construction and maintenance of the website. Considering no **CMS** is used for a relatively simple website with some complex features, this may half development time |
| Emotion CSS | **CSS-Modules** | Since no dynamic styling is required, using a more basic approach with CSS Modules will also make development and maintenance easier |
| Next-Auth | **Supabase** | Instead of relying on using Next-Auth, Supabase will handle authentication, which makes development easier and faster. It boosts the productivity. |
| Cloudflare R2 | **Supabase or R2** | Cloudflare R2 object storage also adds another layer of complexity and pricing. Having storage integrated in Supabase may make things a lot easier and more transparent. Tho, the pricing for Supabase's S3 is quite expensive as of this time, so this choice isn't as obvious. _Also more static objects (such as player images) would be integrated into the project itself._ | 

Overall, the changes in the techstack will boost development productivity and ultimately save a lot of time and effort for future changes.

### Why rely on a BaaS
If this application was to become even more complex, as it has been in the past years, adding something like realtime is done quite quickly. Supabase is a great accelerator for constructing a solid backend. Especially with PL/pgSQL, it is quite easy to establish easy to more complex rules right at database level. Supabase is a perfect choice for this fullstack application. It allows for a clearer annual or monthly pricing to the client and is self-hostable if necessary.

**Pros**: cuts development time, makes maintenance easier, great DX, self-hostable <br />
**Cons**: more expensive, requires PL/pgSQL as the backbone for the backend (otherwise forces unnecessary RTT through more than two API layers), binds client to BaaS and ultimately AWS

## About
The group of roadone is a german music group that covers different artists. The website was wished to be monolingual, which is why there is no native translations.<br/><br/>
Vercel hosting public URL: https://roadone-web.vercel.app/<br/>

The website features a custom blog, gigs (being performances by the group), setlist, user authentication and authorization to edit specific parts of the website or post comments and replies under blog posts. ISR is the primary tool of caching entire pages without obstructing the users experience.

### Techstack
This project uses the _**NTVP**_ techstack. NextJS, Typescript, Vercel hosting and Prisma. It is made with a completely custom component library.<br/>

### Figma
This project has been sketched by myself through Figma first. The final implementation is not pixel-perfect, since the Figma files were just a guideline with which I knew how to structure my pages.
