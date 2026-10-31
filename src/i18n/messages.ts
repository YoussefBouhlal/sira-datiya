export const languages = ['en', 'fr', 'ar'] as const
export type Language = (typeof languages)[number]

export const messages = {
  Colors: ['Couleurs', 'الألوان'],
  Palette: ['Palette', 'لوحة الألوان'],
  Custom: ['Personnalisée', 'مخصصة'],
  Original: ['D’origine', 'الأصلية'],
  Headings: ['Titres', 'العناوين'],
  'Subtitles & details': [
    'Sous-titres et détails',
    'العناوين الفرعية والتفاصيل',
  ],
  'Body text': ['Texte principal', 'النص الأساسي'],
  Accent: ['Décorations', 'الزخارف'],
  Surface: ['Fond', 'الخلفية'],
  'Reset colors': ['Réinitialiser les couleurs', 'إعادة تعيين الألوان'],
  '{role} color picker': ['Sélecteur de couleur : {role}', 'منتقي لون {role}'],
  'Enter a six-digit hex color, such as #177568.': [
    'Saisissez une couleur hexadécimale à six chiffres, comme #177568.',
    'أدخل لونًا سداسيًا من ست خانات، مثل #177568.',
  ],
  'Low contrast on white paper.': [
    'Contraste faible sur papier blanc.',
    'تباين منخفض على الورق الأبيض.',
  ],
  'Low contrast between headings and the section background.': [
    'Contraste faible entre les titres et le fond des sections.',
    'تباين منخفض بين العناوين وخلفية القسم.',
  ],
  Language: ['Langue', 'اللغة'],
  'Choose your language': ['Choisissez votre langue', 'اختر لغتك'],
  'Skip to languages': ['Aller aux langues', 'الانتقال إلى اللغات'],
  'Skip to templates': ['Aller aux modèles', 'الانتقال إلى القوالب'],
  'Skip to editor': ['Aller à l’éditeur', 'الانتقال إلى المحرر'],
  'Sira Datiya home': ['Accueil Sira Datiya', 'الصفحة الرئيسية لسيرة ذاتية'],
  'Saved on this device': [
    'Enregistré sur cet appareil',
    'محفوظ على هذا الجهاز',
  ],
  'Saving...': ['Enregistrement...', 'جارٍ الحفظ...'],
  'Not saved': ['Non enregistré', 'غير محفوظ'],
  'Load example': ['Charger un exemple', 'تحميل مثال'],
  'Just you and your next chapter.': [
    'Votre parcours, votre prochain chapitre.',
    'أنت وخطوتك المهنية القادمة.',
  ],
  'Your data stays here': ['Vos données restent ici', 'بياناتك تبقى هنا'],
  'SIRA DATIYA / CV BUILDER': [
    'SIRA DATIYA / CRÉATEUR DE CV',
    'سيرة ذاتية / منشئ السير الذاتية',
  ],
  'Choose a template': ['Choisir un modèle', 'اختر قالبًا'],
  'Workspace view': ['Vue de l’espace de travail', 'عرض مساحة العمل'],
  Edit: ['Modifier', 'تحرير'],
  Preview: ['Aperçu', 'معاينة'],
  PREVIEW: ['APERÇU', 'معاينة'],
  SECTION: ['SECTION', 'القسم'],
  Back: ['Retour', 'رجوع'],
  Continue: ['Continuer', 'متابعة'],
  'Review CV': ['Vérifier le CV', 'مراجعة السيرة الذاتية'],
  'Document preview': ['Aperçu du document', 'معاينة المستند'],
  'Loading preview...': ['Chargement de l’aperçu...', 'جارٍ تحميل المعاينة...'],
  'Start with a blank page?': ['Repartir de zéro ?', 'هل تريد البدء من جديد؟'],
  'Load the example CV?': [
    'Charger le CV d’exemple ?',
    'هل تريد تحميل السيرة الذاتية النموذجية؟',
  ],
  'Restore this backup?': [
    'Restaurer cette sauvegarde ?',
    'هل تريد استعادة هذه النسخة الاحتياطية؟',
  ],
  'Start over': ['Recommencer', 'البدء من جديد'],
  'Use example': ['Utiliser l’exemple', 'استخدام المثال'],
  'Restore backup': ['Restaurer une sauvegarde', 'استعادة نسخة احتياطية'],
  'This will replace your current CV on this device. Download a JSON backup first to keep a copy.':
    [
      'Votre CV actuel sur cet appareil sera remplacé. Téléchargez d’abord une sauvegarde JSON pour en conserver une copie.',
      'سيحل هذا محل سيرتك الذاتية الحالية على هذا الجهاز. نزّل نسخة احتياطية بصيغة JSON أولًا للاحتفاظ بنسخة.',
    ],
  'Only on this device': ['Uniquement sur cet appareil', 'على هذا الجهاز فقط'],
  'Got it': ['Compris', 'فهمت'],
  'Your CV is saved in this browser, not uploaded to a server. There are no accounts, analytics, or remote font requests.':
    [
      'Votre CV est enregistré dans ce navigateur, sans envoi à un serveur. Aucun compte, outil d’analyse ou chargement distant de polices.',
      'تُحفظ سيرتك الذاتية في هذا المتصفح ولا تُرفع إلى خادم. لا توجد حسابات أو تحليلات أو طلبات خطوط خارجية.',
    ],
  'Browser storage is not encrypted. Clearing site data or using private browsing can remove your CV. Download a JSON backup to keep a copy.':
    [
      'Le stockage du navigateur n’est pas chiffré. Effacer les données du site ou utiliser la navigation privée peut supprimer votre CV. Téléchargez une sauvegarde JSON pour en conserver une copie.',
      'تخزين المتصفح غير مشفّر. قد يؤدي مسح بيانات الموقع أو استخدام التصفح الخاص إلى حذف سيرتك الذاتية. نزّل نسخة احتياطية بصيغة JSON للاحتفاظ بنسخة.',
    ],
  'Close dialog': ['Fermer la fenêtre', 'إغلاق النافذة'],
  Cancel: ['Annuler', 'إلغاء'],
  'Document actions': ['Actions du document', 'إجراءات المستند'],
  'Download backup': ['Télécharger une sauvegarde', 'تنزيل نسخة احتياطية'],
  'CV backup file': [
    'Fichier de sauvegarde du CV',
    'ملف النسخة الاحتياطية للسيرة الذاتية',
  ],
  Dismiss: ['Fermer', 'إغلاق'],
  'This backup could not be opened. Choose a valid Sira Datiya JSON backup smaller than 2 MB.':
    [
      'Impossible d’ouvrir cette sauvegarde. Choisissez une sauvegarde JSON Sira Datiya valide de moins de 2 Mo.',
      'تعذّر فتح هذه النسخة الاحتياطية. اختر نسخة JSON صالحة من سيرة ذاتية بحجم أقل من 2 ميغابايت.',
    ],
  'Personal details': ['Informations personnelles', 'المعلومات الشخصية'],
  'About you': ['À propos de vous', 'معلوماتك'],
  'Professional summary': ['Profil professionnel', 'الملخص المهني'],
  Summary: ['Profil', 'الملخص'],
  'Work experience': ['Expérience professionnelle', 'الخبرة المهنية'],
  Experience: ['Expérience', 'الخبرة'],
  Education: ['Formation', 'التعليم'],
  'Skills & extras': ['Compétences et compléments', 'المهارات والإضافات'],
  'Template & style': ['Modèle et style', 'القالب والتنسيق'],
  'Full name': ['Nom complet', 'الاسم الكامل'],
  'Alex Morgan': ['Camille Martin', 'ليلى منصور'],
  'Professional title': ['Titre professionnel', 'المسمى المهني'],
  'Email address': ['Adresse e-mail', 'البريد الإلكتروني'],
  'Phone number': ['Numéro de téléphone', 'رقم الهاتف'],
  Location: ['Lieu', 'الموقع'],
  'ON THE WEB': ['SUR LE WEB', 'على الإنترنت'],
  'Website or portfolio': [
    'Site web ou portfolio',
    'الموقع الإلكتروني أو معرض الأعمال',
  ],
  LinkedIn: ['LinkedIn', 'لينكدإن'],
  'Product Designer': ['Designer produit', 'مصمم منتجات'],
  'Senior Product Designer': ['Designer produit senior', 'مصمم منتجات أول'],
  'San Francisco, CA': [
    'San Francisco, Californie',
    'سان فرانسيسكو، كاليفورنيا',
  ],
  'Product designer turning complex problems into thoughtful, useful digital experiences...':
    [
      'Designer produit transformant des problèmes complexes en expériences numériques utiles...',
      'مصمم منتجات يحوّل المشكلات المعقدة إلى تجارب رقمية مفيدة ومدروسة...',
    ],
  '{count} characters': ['{count} caractères', '{count} حرف'],
  'Your work experience': [
    'Votre expérience professionnelle',
    'خبراتك المهنية',
  ],
  Position: ['Poste', 'الوظيفة'],
  'Job title': ['Intitulé du poste', 'المسمى الوظيفي'],
  Company: ['Entreprise', 'الشركة'],
  'Start date': ['Date de début', 'تاريخ البدء'],
  'End date': ['Date de fin', 'تاريخ الانتهاء'],
  'I currently work here': [
    'J’occupe actuellement ce poste',
    'أعمل هنا حاليًا',
  ],
  Highlights: ['Réalisations', 'أبرز الإنجازات'],
  'Led the redesign of a product used by 20,000 teams.': [
    'Pilotage de la refonte d’un produit utilisé par 20 000 équipes.',
    'قدت إعادة تصميم منتج يستخدمه 20,000 فريق.',
  ],
  'Add position': ['Ajouter un poste', 'إضافة وظيفة'],
  'Your education': ['Votre formation', 'مسارك التعليمي'],
  Qualification: ['Diplôme', 'المؤهل'],
  'Degree or qualification': ['Diplôme ou qualification', 'الشهادة أو المؤهل'],
  'BFA, Communication Design': [
    'Licence en design de communication',
    'بكالوريوس الفنون في تصميم الاتصال',
  ],
  'School or university': ['École ou université', 'المدرسة أو الجامعة'],
  'Additional details': ['Informations complémentaires', 'تفاصيل إضافية'],
  'Add education': ['Ajouter une formation', 'إضافة تعليم'],
  Skills: ['Compétences', 'المهارات'],
  Skill: ['Compétence', 'المهارة'],
  'Skill name': ['Nom de la compétence', 'اسم المهارة'],
  Proficiency: ['Niveau de maîtrise', 'مستوى الإتقان'],
  'Proficiency display': ['Affichage du niveau', 'عرض مستوى الإتقان'],
  'Bar only': ['Barre uniquement', 'الشريط فقط'],
  'Text only': ['Texte uniquement', 'النص فقط'],
  Both: ['Les deux', 'كلاهما'],
  Unrated: ['Non évalué', 'غير محدد'],
  Beginner: ['Débutant', 'مبتدئ'],
  Elementary: ['Élémentaire', 'أساسي'],
  Intermediate: ['Intermédiaire', 'متوسط'],
  Advanced: ['Avancé', 'متقدم'],
  Expert: ['Expert', 'خبير'],
  'Add skill': ['Ajouter une compétence', 'إضافة مهارة'],
  Languages: ['Langues', 'اللغات'],
  'English (native)\nFrench (conversational)': [
    'Français (langue maternelle)\nAnglais (conversationnel)',
    'العربية (اللغة الأم)\nالإنجليزية (محادثة)',
  ],
  Certifications: ['Certifications', 'الشهادات المهنية'],
  Projects: ['Projets', 'المشاريع'],
  Project: ['Projet', 'المشروع'],
  'Project name': ['Nom du projet', 'اسم المشروع'],
  'Project URL': ['Adresse du projet', 'رابط المشروع'],
  'Project details': ['Détails du projet', 'تفاصيل المشروع'],
  'Add project': ['Ajouter un projet', 'إضافة مشروع'],
  References: ['Références', 'المراجع'],
  Reference: ['Référence', 'المرجع'],
  'Reference name': ['Nom de la référence', 'اسم المرجع'],
  'Reference job title': ['Poste de la référence', 'المسمى الوظيفي للمرجع'],
  'Reference organization': ['Organisation de la référence', 'جهة عمل المرجع'],
  'Reference email': ['E-mail de la référence', 'البريد الإلكتروني للمرجع'],
  'Reference phone': ['Téléphone de la référence', 'هاتف المرجع'],
  'Add reference': ['Ajouter une référence', 'إضافة مرجع'],
  'Move reference up': ['Monter la référence', 'نقل المرجع للأعلى'],
  'Move reference down': ['Descendre la référence', 'نقل المرجع للأسفل'],
  'Move reference {count} up': [
    'Monter la référence {count}',
    'نقل المرجع {count} للأعلى',
  ],
  'Move reference {count} down': [
    'Descendre la référence {count}',
    'نقل المرجع {count} للأسفل',
  ],
  'Remove {title} {count}': [
    'Supprimer {title} {count}',
    'حذف {title} {count}',
  ],
  'Remove {title}': ['Supprimer {title}', 'حذف {title}'],
  'YOUR DOCUMENT': ['VOTRE DOCUMENT', 'مستندك'],
  'CV sections': ['Rubriques du CV', 'أقسام السيرة الذاتية'],
  'Filled in': ['Renseigné', 'مكتمل'],
  'All sections filled in': [
    'Toutes les rubriques sont renseignées',
    'جميع الأقسام مكتملة',
  ],
  '{count} of 5 sections filled in': [
    '{count} rubriques sur 5 renseignées',
    '{count} من 5 أقسام مكتملة',
  ],
  Portrait: ['Photo', 'الصورة الشخصية'],
  'Replace portrait': ['Remplacer la photo', 'استبدال الصورة'],
  'Upload portrait': ['Importer une photo', 'رفع صورة شخصية'],
  'Your portrait': ['Votre photo', 'صورتك الشخصية'],
  'Remove portrait': ['Supprimer la photo', 'حذف الصورة'],
  'Preparing portrait...': [
    'Préparation de la photo...',
    'جارٍ إعداد الصورة...',
  ],
  'Choose a PNG or JPEG portrait.': [
    'Choisissez une photo PNG ou JPEG.',
    'اختر صورة بصيغة PNG أو JPEG.',
  ],
  'Choose a portrait smaller than 10 MB.': [
    'Choisissez une photo de moins de 10 Mo.',
    'اختر صورة بحجم أقل من 10 ميغابايت.',
  ],
  'This browser could not prepare the portrait.': [
    'Ce navigateur n’a pas pu préparer la photo.',
    'تعذّر على هذا المتصفح إعداد الصورة.',
  ],
  'This portrait is too detailed to save. Choose a smaller image.': [
    'Cette photo est trop volumineuse. Choisissez une image plus petite.',
    'هذه الصورة كبيرة جدًا للحفظ. اختر صورة أصغر.',
  ],
  'The portrait could not be opened. Choose another PNG or JPEG.': [
    'Impossible d’ouvrir la photo. Choisissez un autre fichier PNG ou JPEG.',
    'تعذّر فتح الصورة. اختر صورة أخرى بصيغة PNG أو JPEG.',
  ],
  'Use this template': ['Utiliser ce modèle', 'استخدام هذا القالب'],
  'Inspect {name}': ['Examiner {name}', 'معاينة {name}'],
  Current: ['Actuel', 'الحالي'],
  Template: ['Modèle', 'القالب'],
  Templates: ['Modèles', 'القوالب'],
  'Two columns': ['Deux colonnes', 'عمودان'],
  'Single column': ['Une colonne', 'عمود واحد'],
  'Browse templates': ['Parcourir les modèles', 'تصفح القوالب'],
  'Accent color': ['Couleur d’accent', 'اللون المميز'],
  Forest: ['Forêt', 'أخضر غابي'],
  Cobalt: ['Cobalt', 'أزرق كوبالت'],
  Rose: ['Rose', 'وردي'],
  Ink: ['Encre', 'حبري'],
  'Text size': ['Taille du texte', 'حجم النص'],
  Small: ['Petit', 'صغير'],
  Medium: ['Moyen', 'متوسط'],
  Large: ['Grand', 'كبير'],
  'Paper size': ['Format du papier', 'حجم الورق'],
  'A4 (210 x 297 mm)': ['A4 (210 x 297 mm)', 'A4 (210 × 297 مم)'],
  'US Letter (8.5 x 11 in)': [
    'Lettre US (8,5 x 11 pouces)',
    'Letter (8.5 × 11 بوصة)',
  ],
  'US Letter': ['Lettre US', 'Letter'],
  'Close template gallery': [
    'Fermer la galerie de modèles',
    'إغلاق معرض القوالب',
  ],
  'Template collection': ['Collection de modèles', 'مجموعة القوالب'],
  'Search templates': ['Rechercher un modèle', 'البحث عن قوالب'],
  Layout: ['Disposition', 'التخطيط'],
  'All layouts': ['Toutes les dispositions', 'جميع التخطيطات'],
  '{count} templates': ['{count} modèles', '{count} قوالب'],
  '{count} template': ['{count} modèle', '{count} قالب'],
  'No templates found.': ['Aucun modèle trouvé.', 'لم يتم العثور على قوالب.'],
  'Clear filters': ['Effacer les filtres', 'مسح المرشحات'],
  'Back to templates': ['Retour aux modèles', 'العودة إلى القوالب'],
  'Template CV preview': [
    'Aperçu du modèle de CV',
    'معاينة قالب السيرة الذاتية',
  ],
  'Use template': ['Utiliser le modèle', 'استخدام القالب'],
  'Preview unavailable': ['Aperçu indisponible', 'المعاينة غير متاحة'],
  'Preview unavailable. You can still download the PDF.': [
    'Aperçu indisponible. Vous pouvez toujours télécharger le PDF.',
    'المعاينة غير متاحة. لا يزال بإمكانك تنزيل PDF.',
  ],
  'CV preview, page {page}': [
    'Aperçu du CV, page {page}',
    'معاينة السيرة الذاتية، الصفحة {page}',
  ],
  Loading: ['Chargement', 'جارٍ التحميل'],
  'Add your name to download': [
    'Ajoutez votre nom pour télécharger',
    'أضف اسمك للتنزيل',
  ],
  'Download PDF': ['Télécharger le PDF', 'تنزيل PDF'],
  'Preparing your document': ['Préparation du document', 'جارٍ إعداد المستند'],
  'Updating preview...': [
    'Mise à jour de l’aperçu...',
    'جارٍ تحديث المعاينة...',
  ],
  'Previous preview page': [
    'Page précédente de l’aperçu',
    'صفحة المعاينة السابقة',
  ],
  'Previous page': ['Page précédente', 'الصفحة السابقة'],
  'Next preview page': ['Page suivante de l’aperçu', 'صفحة المعاينة التالية'],
  'Next page': ['Page suivante', 'الصفحة التالية'],
  'Page {page} of {total}': [
    'Page {page} sur {total}',
    'الصفحة {page} من {total}',
  ],
  'CV preview text': ['Texte de l’aperçu du CV', 'نص معاينة السيرة الذاتية'],
  'Your name': ['Votre nom', 'اسمك'],
  'CV owner': ['Titulaire du CV', 'صاحب السيرة الذاتية'],
  '{name} portrait': ['Photo de {name}', 'صورة {name}'],
  Present: ['Aujourd’hui', 'حتى الآن'],
  Profile: ['Profil', 'الملف الشخصي'],
  Details: ['Coordonnées', 'التفاصيل'],
  'Employment History': ['Parcours professionnel', 'السجل الوظيفي'],
  'Professional Experience': ['Expérience professionnelle', 'الخبرة المهنية'],
  'Areas of Expertise': ['Domaines de compétence', 'مجالات الخبرة'],
  'Technical Skills': ['Compétences techniques', 'المهارات التقنية'],
  'Additional Information': ['Informations complémentaires', 'معلومات إضافية'],
  'Professional References': ['Références professionnelles', 'المراجع المهنية'],
  'Page {page}': ['Page {page}', 'الصفحة {page}'],
  'The saved CV could not be opened. It may belong to a newer version. Your saved data has not been changed.':
    [
      'Impossible d’ouvrir le CV enregistré. Il peut provenir d’une version plus récente. Vos données enregistrées n’ont pas été modifiées.',
      'تعذّر فتح السيرة الذاتية المحفوظة. قد تكون من إصدار أحدث. لم يتم تغيير بياناتك المحفوظة.',
    ],
  'Browser storage could not be read. Your existing saved data has not been changed.':
    [
      'Impossible de lire le stockage du navigateur. Vos données enregistrées n’ont pas été modifiées.',
      'تعذّرت قراءة تخزين المتصفح. لم يتم تغيير بياناتك المحفوظة.',
    ],
  'Your changes could not be saved in this browser. Keep this tab open and download a backup.':
    [
      'Impossible d’enregistrer vos modifications dans ce navigateur. Gardez cet onglet ouvert et téléchargez une sauvegarde.',
      'تعذّر حفظ تغييراتك في هذا المتصفح. أبقِ علامة التبويب مفتوحة ونزّل نسخة احتياطية.',
    ],
  'Browser storage could not be cleared. Check your browser privacy settings.':
    [
      'Impossible d’effacer le stockage du navigateur. Vérifiez ses paramètres de confidentialité.',
      'تعذّر مسح تخزين المتصفح. تحقق من إعدادات الخصوصية في متصفحك.',
    ],
  'Browser storage is unavailable. You can still edit and download your CV, but changes will not be saved.':
    [
      'Le stockage du navigateur est indisponible. Vous pouvez modifier et télécharger votre CV, mais les modifications ne seront pas enregistrées.',
      'تخزين المتصفح غير متاح. يمكنك تحرير سيرتك الذاتية وتنزيلها، لكن لن تُحفظ التغييرات.',
    ],
  'Browser storage is unavailable. Download a backup before closing this tab.':
    [
      'Le stockage du navigateur est indisponible. Téléchargez une sauvegarde avant de fermer cet onglet.',
      'تخزين المتصفح غير متاح. نزّل نسخة احتياطية قبل إغلاق علامة التبويب.',
    ],
  'Browser storage could not be cleared. Your current CV has not been changed.':
    [
      'Impossible d’effacer le stockage du navigateur. Votre CV actuel n’a pas été modifié.',
      'تعذّر مسح تخزين المتصفح. لم يتم تغيير سيرتك الذاتية الحالية.',
    ],
  'The PDF could not be generated. Your CV content is still saved. Try another template or reload the page.':
    [
      'Impossible de générer le PDF. Le contenu de votre CV est conservé. Essayez un autre modèle ou rechargez la page.',
      'تعذّر إنشاء PDF. لا يزال محتوى سيرتك الذاتية محفوظًا. جرّب قالبًا آخر أو أعد تحميل الصفحة.',
    ],
  'The PDF preview could not be displayed. Try downloading the PDF instead.': [
    'Impossible d’afficher l’aperçu PDF. Essayez de télécharger le PDF.',
    'تعذّر عرض معاينة PDF. جرّب تنزيل ملف PDF بدلًا من ذلك.',
  ],
} satisfies Record<string, readonly [string, string]>

export type Message = keyof typeof messages

export function translate(
  language: Language,
  message: string,
  values: Record<string, string | number> = {},
): string {
  const entry = messages[message as Message]
  const text =
    language === 'en' || !entry ? message : entry[language === 'fr' ? 0 : 1]
  return text.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    String(values[key] ?? placeholder),
  )
}

export function formatMonth(value: string, language: Language): string {
  if (!value) return ''
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(`${language}-u-nu-latn`, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, 1)))
}

export function dateRange(
  start: string,
  end: string,
  current: boolean,
  language: Language,
): string {
  return [
    formatMonth(start, language),
    current ? translate(language, 'Present') : formatMonth(end, language),
  ]
    .filter(Boolean)
    .join(' - ')
}
