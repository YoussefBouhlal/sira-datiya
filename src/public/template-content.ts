import type { PublicLanguage } from './content.ts'

export const publicTemplateNumbers = ['001', '003', '005'] as const
export type PublicTemplateNumber = (typeof publicTemplateNumbers)[number]
export const publicPagePaths = [
  '',
  'help/',
  'privacy/',
  'templates/',
  ...publicTemplateNumbers.map((number) => `templates/${number}/`),
]

type TemplateCopy = {
  name: string
  description: string
  use: string
  limitation: string
  imageAlt: string
}

type GalleryCopy = {
  heading: string
  description: string
  overview: string
  navigation: string
  detail: string
  useHeading: string
  limitationHeading: string
  previewHeading: string
  entryNote: string
  useTemplate: string
  applyNote: string
  availability: string
  templates: Record<PublicTemplateNumber, TemplateCopy>
}

export const galleryCopy: Record<PublicLanguage, GalleryCopy> = {
  en: {
    heading: 'Siravuno CV templates',
    description:
      'Compare three Siravuno CV layouts: a serif single column, a sidebar layout and a text-first design. Explore fictional English, French and Arabic previews.',
    overview: 'About Siravuno',
    navigation: 'Template page language',
    detail: 'Explore template',
    useHeading: 'When this layout fits',
    limitationHeading: 'What to consider',
    previewHeading: 'Fictional PDF preview',
    useTemplate: 'Use this template',
    applyNote:
      'Applying this template keeps your CV content and document language. Switching templates resets custom colors, but keeps other appearance settings. The fictional example is not loaded.',
    entryNote:
      'Opening the builder does not select this template or load the example. Choose your template inside the builder; your existing CV content and document language stay unchanged.',
    availability:
      'A selection of three layouts from the builder. Each supports English, French and Arabic, optional portraits, A4 and US Letter. These previews show the first page of a fictional A4 CV; your content and settings determine the final page count.',
    templates: {
      '001': {
        name: 'Template 001',
        description:
          'A serif, single-column CV with a centered identity, fine accent rules and narrow date rails beside experience and education.',
        use: 'Choose this layout when you want a chronological CV with clear date alignment and a traditional typographic hierarchy. Skills stay in a flat list, with named proficiency when supplied.',
        limitation:
          'Long role titles and dates share horizontal space. Review line wrapping with your own content. Long content continues onto additional pages rather than shrinking automatically.',
        imageAlt:
          'Fictional English CV in Template 001: centered serif identity, horizontal section rules and dates beside experience and education.',
      },
      '003': {
        name: 'Template 003',
        description:
          'A serif, two-column CV that separates contact details, skills and languages in a shaded sidebar from the main career history.',
        use: 'Choose this layout to keep supporting information visually separate from experience and education. Rated skills use bars with named levels by default; Arabic mirrors the columns.',
        limitation:
          'The sidebar leaves less width for career descriptions, and its background repeats on later pages. Two-column reading order may vary between PDF readers and recruitment systems; check your exported file.',
        imageAlt:
          'Fictional English CV in Template 003: shaded contact and skills sidebar beside a wider experience and education column.',
      },
      '005': {
        name: 'Template 005',
        description:
          'A compact, text-first sans-serif CV with a single main column, uppercase ruled headings and a four-column skills grid.',
        use: 'Choose this layout when you prefer a text-led career history with right-aligned dates and bulleted descriptions. Skills appear in row-major order, with named proficiency when supplied.',
        limitation:
          'Long skill names can wrap in the four-column grid. A text-first layout and selectable PDF text do not guarantee compatibility with every applicant-tracking system.',
        imageAlt:
          'Fictional English CV in Template 005: sans-serif identity, uppercase ruled headings, single-column experience and a compact skills grid.',
      },
    },
  },
  fr: {
    heading: 'Modèles de CV Siravuno',
    description:
      'Comparez trois modèles de CV Siravuno : une colonne à empattements, une barre latérale et une présentation centrée sur le texte. Exemples fictifs en français, anglais et arabe.',
    overview: 'À propos de Siravuno',
    navigation: 'Langue de la page des modèles',
    detail: 'Découvrir le modèle',
    useHeading: 'Quand choisir cette présentation',
    limitationHeading: 'Points à vérifier',
    previewHeading: 'Aperçu PDF fictif',
    useTemplate: 'Utiliser ce modèle',
    applyNote:
      'Appliquer ce modèle conserve le contenu du CV et la langue du document. Changer de modèle réinitialise les couleurs personnalisées, mais conserve les autres réglages de présentation. L’exemple fictif n’est pas chargé.',
    entryNote:
      'Ouvrir l’éditeur ne sélectionne pas ce modèle et ne charge pas l’exemple. Choisissez votre modèle dans l’éditeur ; le contenu de votre CV existant et la langue du document sont conservés.',
    availability:
      'Une sélection de trois présentations disponibles dans l’éditeur. Chacune prend en charge le français, l’anglais et l’arabe, un portrait facultatif et les formats A4 et US Letter. Ces aperçus montrent la première page d’un CV fictif au format A4 ; votre contenu et vos réglages déterminent le nombre final de pages.',
    templates: {
      '001': {
        name: 'Modèle 001',
        description:
          'Un CV à une colonne avec une typographie à empattements, une identité centrée, de fins filets colorés et une colonne de dates étroite pour l’expérience et la formation.',
        use: 'Pour un CV chronologique aux dates bien alignées et à la hiérarchie typographique classique. Les compétences forment une liste simple, avec les niveaux rédigés lorsqu’ils sont renseignés.',
        limitation:
          'Les intitulés longs et les dates se partagent la largeur. Vérifiez les retours à la ligne avec votre contenu. Le texte long se poursuit sur les pages suivantes sans réduction automatique de la taille.',
        imageAlt:
          'CV fictif en français dans le modèle 001 : identité centrée à empattements, filets horizontaux et dates à côté de l’expérience et de la formation.',
      },
      '003': {
        name: 'Modèle 003',
        description:
          'Un CV à empattements sur deux colonnes, avec les coordonnées, compétences et langues dans une barre latérale ombrée, séparées du parcours professionnel.',
        use: 'Pour distinguer visuellement les informations complémentaires de l’expérience et de la formation. Les compétences évaluées affichent par défaut des barres et des niveaux rédigés ; l’arabe inverse les colonnes.',
        limitation:
          'La barre latérale réduit la largeur des descriptions et son fond se répète sur les pages suivantes. L’ordre de lecture des deux colonnes peut varier selon le lecteur PDF ou le logiciel de recrutement ; vérifiez le fichier exporté.',
        imageAlt:
          'CV fictif en français dans le modèle 003 : barre latérale ombrée avec coordonnées et compétences, à côté de l’expérience et de la formation.',
      },
      '005': {
        name: 'Modèle 005',
        description:
          'Un CV compact sans empattements, centré sur le texte, avec une colonne principale, des titres majuscules encadrés de filets et une grille de compétences sur quatre colonnes.',
        use: 'Pour privilégier le texte du parcours, des dates alignées à droite et des descriptions à puces. Les compétences se lisent ligne par ligne, avec les niveaux rédigés lorsqu’ils sont renseignés.',
        limitation:
          'Les compétences longues peuvent revenir à la ligne dans la grille. Une présentation centrée sur le texte et un PDF au texte sélectionnable ne garantissent pas la compatibilité avec tous les logiciels de suivi des candidatures.',
        imageAlt:
          'CV fictif en français dans le modèle 005 : identité sans empattements, titres majuscules à filets, expérience sur une colonne et grille de compétences compacte.',
      },
    },
  },
  ar: {
    heading: 'قوالب السيرة الذاتية من Siravuno',
    description:
      'قارن ثلاثة قوالب من Siravuno: عمود واحد بطابع تقليدي، وتخطيط بشريط جانبي، وتصميم يركز على النص. أمثلة خيالية بالعربية والفرنسية والإنجليزية.',
    overview: 'عن Siravuno',
    navigation: 'لغة صفحة القوالب',
    detail: 'استكشف القالب',
    useHeading: 'متى يناسبك هذا التخطيط',
    limitationHeading: 'ما ينبغي مراجعته',
    previewHeading: 'معاينة PDF خيالية',
    useTemplate: 'استخدم هذا القالب',
    applyNote:
      'يحافظ تطبيق هذا القالب على محتوى سيرتك ولغة المستند. يزيل تغيير القالب الألوان المخصصة مع الاحتفاظ بإعدادات المظهر الأخرى. لا يتم تحميل المثال الخيالي.',
    entryNote:
      'فتح المحرر لا يختار هذا القالب ولا يحمّل المثال. اختر القالب داخل المحرر؛ يبقى محتوى سيرتك الذاتية الحالية ولغة المستند دون تغيير.',
    availability:
      'مجموعة مختارة من ثلاثة تخطيطات متاحة في المحرر. يدعم كل منها العربية والفرنسية والإنجليزية، وصورة شخصية اختيارية، وورق A4 وUS Letter. تعرض هذه المعاينات الصفحة الأولى من سيرة خيالية على ورق A4؛ يحدد محتواك وإعداداتك عدد الصفحات النهائي.',
    templates: {
      '001': {
        name: 'القالب 001',
        description:
          'سيرة ذاتية بعمود واحد وهوية تتوسط الصفحة، وفواصل أفقية رفيعة، ومساحة ضيقة للتواريخ بجانب الخبرة والتعليم. تستخدم النسختان الإنجليزية والفرنسية خطوطًا ذات زوائد.',
        use: 'يناسب عرض المسار المهني زمنيًا مع محاذاة واضحة للتواريخ وتسلسل بصري تقليدي. تظهر المهارات في قائمة بسيطة مع مستويات مكتوبة عند إدخالها.',
        limitation:
          'تتقاسم المسميات الطويلة والتواريخ المساحة الأفقية. راجع التفاف الأسطر بمحتواك الفعلي. يستمر المحتوى الطويل في صفحات إضافية دون تصغير الخط تلقائيًا.',
        imageAlt:
          'سيرة ذاتية عربية خيالية في القالب 001: هوية تتوسط الصفحة وفواصل أفقية وتواريخ بجانب الخبرة والتعليم.',
      },
      '003': {
        name: 'القالب 003',
        description:
          'سيرة ذاتية بعمودين تفصل معلومات الاتصال والمهارات واللغات في شريط جانبي مظلل عن المسار المهني في العمود الرئيسي.',
        use: 'يناسب فصل المعلومات المساندة بصريًا عن الخبرة والتعليم. تظهر المهارات المقيّمة افتراضيًا بأشرطة ومستويات مكتوبة؛ ينعكس ترتيب الأعمدة في العربية.',
        limitation:
          'يقلل الشريط الجانبي عرض أوصاف الخبرة وتتكرر خلفيته في الصفحات التالية. قد يختلف ترتيب قراءة العمودين بين قارئات PDF وأنظمة التوظيف؛ راجع الملف المصدّر.',
        imageAlt:
          'سيرة ذاتية عربية خيالية في القالب 003: شريط جانبي مظلل للاتصال والمهارات بجانب عمود أوسع للخبرة والتعليم.',
      },
      '005': {
        name: 'القالب 005',
        description:
          'سيرة ذاتية مدمجة تركز على النص، بعمود رئيسي واحد وعناوين بين خطوط رفيعة وشبكة مهارات بأربعة أعمدة. تستخدم النسختان الإنجليزية والفرنسية خطًا بلا زوائد وعناوين بأحرف كبيرة.',
        use: 'يناسب إبراز نص المسار المهني والتواريخ والأوصاف ذات النقاط. تُقرأ المهارات صفًا بعد صف مع مستويات مكتوبة عند إدخالها. تنعكس المحاذاة في العربية.',
        limitation:
          'قد تلتف أسماء المهارات الطويلة داخل شبكة الأعمدة الأربعة. لا يضمن التركيز على النص وإمكانية تحديد نص PDF التوافق مع جميع أنظمة تتبع المتقدمين.',
        imageAlt:
          'سيرة ذاتية عربية خيالية في القالب 005: عناوين بين فواصل أفقية وخبرة بعمود واحد وشبكة مهارات مدمجة.',
      },
    },
  },
}
