Pages that require including mixins for components to build a template:
- editingEntry.pug
- submit.pug

.pug pages that use coreURL, meaning they need changing upon changing coreURL in any place
- image.pug
- submitImage.pug
- dashboard__curata.pug ''
- curataAppearance.pug ''
- curataCollaborators.pug ''
- curataFiles.pug ''
- curatas.pug ''
- curataSettings.pug ''
- curataTemplates.pug ''
- entry__editing.pug ''
- entries.pug ''
- layout.pug ''
- layout_buttonless.pug ''
- layout_buttonless_public.pug ''
- layout_initial.pug ''
- layout_public.pug ''
- new_list_from_template.pug ''
- entry__published.pug ''
- RegisterSuccess.pug ''
- submitEntry.pug ""
- template-list.pug ''
- template.pug ''
- entry__view.pug ''
(- curataList.pug '') 

" + coreURL + "
' + coreURL + '

- var coreURL = "dashboard";
- var coreURL = 'dashboard';



Todo refactoring and uniforming
- Where it is "" change to '' wherever possible or vice versa if better and then mark that quotations status is good
- Check all .pug files, where it is href='/...' without a space after the equals sign, add a space
- Update all variable names to be uniform based on a single system
- Update all file names to be uniform and update all files that used old names


Error troubleshoot:
- check for missing ';'
- check if coreURL is not updated somewhere
- check if some variable is in the wrong place in a pug file