export const publicLanguages = ['en', 'fr', 'ar'] as const
export type PublicLanguage = (typeof publicLanguages)[number]
export const languageNames = { en: 'English', fr: 'Français', ar: 'العربية' }

type OverviewCopy = {
  title: string
  description: string
  heading: string
  skip: string
  builder: string
  navigation: string
  languages: string
  lead: string
  languageNote: string
  imageAlt: string
  template: string
  fictional: string
  factsHeading: string
  facts: readonly { heading: string; body: string }[]
  draft: string
  storageHeading: readonly [string, string]
  storage: readonly string[]
  exportHeading: string
  exportNote: string
  footer: string
}

export const overviewCopy: Record<PublicLanguage, OverviewCopy> = {
  en: {
    title: 'Siravuno CV Builder | English, French and Arabic CVs',
    description:
      'Create a CV in English, French or Arabic with Siravuno. Keep your draft in your browser, choose a template, and export a selectable-text PDF.',
    heading: 'Siravuno CV Builder',
    skip: 'Skip to content',
    builder: 'Open CV builder',
    navigation: 'Overview language',
    languages: 'ENGLISH / FRENCH / ARABIC',
    lead: 'Your experience, your words, your next chapter. Create a CV, choose its presentation, and download a PDF. No account required.',
    languageNote:
      'English, French and Arabic, including right-to-left Arabic layouts. Changing language translates default labels, not your written content.',
    imageAlt:
      'Template 001 showing a fictional English CV with profile, experience, education and skills in a single-column layout.',
    template: 'Template 001',
    fictional: 'Fictional example. Not your saved CV.',
    factsHeading: 'One CV. Your choice of presentation.',
    facts: [
      {
        heading: 'Write what matters',
        body: 'Personal details, profile, experience, education, skills, languages, certifications, projects and references. Add an optional portrait, or leave it out.',
      },
      {
        heading: 'Keep your words',
        body: 'Switch templates without replacing your CV content. Adjust colors, text size and A4 or US Letter paper in the builder.',
      },
      {
        heading: 'Take a PDF with you',
        body: 'Preview your CV before downloading a selectable-text PDF. English, French, Arabic and mixed Arabic/Latin content are supported. Other scripts are not guaranteed.',
      },
    ],
    draft: 'YOUR DRAFT',
    storageHeading: ['Saved in your browser.', 'Backed up by you.'],
    storage: [
      'The builder stores one current CV in this browser profile. CV editing, portrait processing and PDF generation run on your device. There is no cloud sync or account recovery.',
      'Browser storage is not encrypted or a permanent backup. Clearing site data or using private browsing can remove your CV. Download a JSON backup from the document actions menu to keep a copy, then restore that file when needed.',
      'Opening this overview does not load or change your draft. Returning to the builder keeps your saved content and document language.',
    ],
    exportHeading: 'A note about PDF exports',
    exportNote:
      'PDF text is selectable, but universal applicant-tracking system compatibility and tagged-PDF accessibility are not guaranteed. Arabic text extraction can introduce additional spaces. Review your exported CV before sharing it.',
    footer: 'English overview',
  },
  fr: {
    title: 'Siravuno | Créer un CV en français, anglais ou arabe',
    description:
      'Créez votre CV avec Siravuno en français, anglais ou arabe. Gardez votre brouillon dans votre navigateur, choisissez un modèle et exportez un PDF au texte sélectionnable.',
    heading: 'Siravuno, créateur de CV',
    skip: 'Aller au contenu',
    builder: 'Créer mon CV',
    navigation: 'Langue de la présentation',
    languages: 'ANGLAIS / FRANÇAIS / ARABE',
    lead: 'Votre expérience, vos mots, votre prochaine étape. Créez un CV, choisissez sa présentation et téléchargez un PDF. Aucun compte nécessaire.',
    languageNote:
      'Anglais, français et arabe, avec des mises en page arabes de droite à gauche. Changer de langue traduit les libellés par défaut, pas le contenu que vous avez rédigé.',
    imageAlt:
      'Modèle 001 présentant un CV fictif en français avec profil, expérience, formation et compétences dans une mise en page à une colonne.',
    template: 'Modèle 001',
    fictional: 'Exemple fictif. Ce n’est pas votre CV enregistré.',
    factsHeading: 'Un CV. La présentation de votre choix.',
    facts: [
      {
        heading: 'Présentez l’essentiel',
        body: 'Coordonnées, profil, expérience, formation, compétences, langues, certifications, projets et références. Ajoutez un portrait si vous le souhaitez.',
      },
      {
        heading: 'Gardez vos mots',
        body: 'Changez de modèle sans remplacer le contenu de votre CV. Ajustez les couleurs, la taille du texte et le format A4 ou US Letter dans l’éditeur.',
      },
      {
        heading: 'Emportez votre PDF',
        body: 'Prévisualisez votre CV avant de télécharger un PDF au texte sélectionnable. L’anglais, le français, l’arabe et les contenus mêlant caractères arabes et latins sont pris en charge. Les autres écritures ne sont pas garanties.',
      },
    ],
    draft: 'VOTRE BROUILLON',
    storageHeading: [
      'Enregistré dans votre navigateur.',
      'Sauvegardé par vos soins.',
    ],
    storage: [
      'L’éditeur conserve un seul CV actuel dans ce profil de navigateur. La modification du CV, le traitement du portrait et la création du PDF s’effectuent sur votre appareil. Il n’y a ni synchronisation cloud ni récupération de compte.',
      'Le stockage du navigateur n’est ni chiffré ni une sauvegarde permanente. Effacer les données du site ou utiliser la navigation privée peut supprimer votre CV. Téléchargez une sauvegarde JSON depuis le menu d’actions du document pour en conserver une copie, puis restaurez ce fichier si nécessaire.',
      'Ouvrir cette présentation ne charge ni ne modifie votre brouillon. Le retour à l’éditeur conserve votre contenu enregistré et la langue du document.',
    ],
    exportHeading: 'À propos des exports PDF',
    exportNote:
      'Le texte du PDF est sélectionnable, mais la compatibilité avec tous les logiciels de suivi des candidatures et l’accessibilité par balisage PDF ne sont pas garanties. L’extraction du texte arabe peut ajouter des espaces. Vérifiez votre CV exporté avant de le partager.',
    footer: 'Présentation en français',
  },
  ar: {
    title: 'Siravuno | إنشاء سيرة ذاتية بالعربية والفرنسية والإنجليزية',
    description:
      'أنشئ سيرتك الذاتية بالعربية أو الفرنسية أو الإنجليزية مع Siravuno. احفظ مسودتك في متصفحك واختر قالبًا وصدّر ملف PDF بنص قابل للتحديد.',
    heading: 'Siravuno لإنشاء السيرة الذاتية',
    skip: 'انتقل إلى المحتوى',
    builder: 'افتح محرر السيرة الذاتية',
    navigation: 'لغة صفحة التعريف',
    languages: 'الإنجليزية / الفرنسية / العربية',
    lead: 'خبرتك وكلماتك وخطوتك القادمة. أنشئ سيرة ذاتية واختر طريقة عرضها ونزّل ملف PDF. لا تحتاج إلى حساب.',
    languageNote:
      'الإنجليزية والفرنسية والعربية، مع تخطيطات عربية من اليمين إلى اليسار. يترجم تغيير اللغة التسميات الافتراضية، وليس المحتوى الذي كتبته.',
    imageAlt:
      'القالب 001 يعرض سيرة ذاتية عربية خيالية تضم النبذة والخبرة والتعليم والمهارات في تخطيط بعمود واحد.',
    template: 'القالب 001',
    fictional: 'مثال خيالي، وليس سيرتك الذاتية المحفوظة.',
    factsHeading: 'سيرة ذاتية واحدة، والعرض من اختيارك.',
    facts: [
      {
        heading: 'اكتب ما يهم',
        body: 'المعلومات الشخصية والنبذة والخبرة والتعليم والمهارات واللغات والشهادات والمشاريع والمراجع. أضف صورة شخصية إن رغبت أو اتركها دون صورة.',
      },
      {
        heading: 'احتفظ بكلماتك',
        body: 'بدّل القوالب دون استبدال محتوى سيرتك الذاتية. عدّل الألوان وحجم النص واختر ورق A4 أو US Letter في المحرر.',
      },
      {
        heading: 'خذ معك ملف PDF',
        body: 'عاين سيرتك الذاتية قبل تنزيل ملف PDF بنص قابل للتحديد. يدعم الإنجليزية والفرنسية والعربية والمحتوى المختلط بالعربية والحروف اللاتينية. لا نضمن دعم أنظمة الكتابة الأخرى.',
      },
    ],
    draft: 'مسودتك',
    storageHeading: ['محفوظة في متصفحك.', 'ونسختها الاحتياطية مسؤوليتك.'],
    storage: [
      'يحتفظ المحرر بسيرة ذاتية حالية واحدة في ملف تعريف هذا المتصفح. يجري تحرير السيرة ومعالجة الصورة وإنشاء ملف PDF على جهازك. لا توجد مزامنة سحابية أو استعادة عبر حساب.',
      'تخزين المتصفح غير مشفّر وليس نسخة احتياطية دائمة. قد يؤدي مسح بيانات الموقع أو استخدام التصفح الخاص إلى إزالة سيرتك الذاتية. نزّل نسخة احتياطية بصيغة JSON من قائمة إجراءات المستند للاحتفاظ بها، ثم استعد الملف عند الحاجة.',
      'لا يؤدي فتح صفحة التعريف هذه إلى تحميل مسودتك أو تغييرها. يحافظ الرجوع إلى المحرر على محتواك المحفوظ ولغة المستند.',
    ],
    exportHeading: 'ملاحظة حول تصدير PDF',
    exportNote:
      'نص PDF قابل للتحديد، لكننا لا نضمن التوافق مع جميع أنظمة تتبع المتقدمين أو إتاحة ملفات PDF الموسومة لذوي الإعاقة. قد يضيف استخراج النص العربي مسافات إضافية. راجع سيرتك الذاتية المصدّرة قبل مشاركتها.',
    footer: 'صفحة التعريف بالعربية',
  },
}

export function previewFilename(language: PublicLanguage, number = '001') {
  return `template-${number}${language === 'en' ? '' : `-${language}`}.png`
}
