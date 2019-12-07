- Unify 'Q&A' with 'Expandable', with options to use it as either one
- Remove first and last name to avoid unnecessary beginning complexity

- Scrap membership from MVP, including special features like 'Appearance', etc.

- fix new list adding (never finishes template creation post-typing)
	- fixed it: upon fixing promise issue of 'res.status(200).end()' which ended functions too fast, I wrapped some res.status(200).end() functions inside some functions to  make sure they only execute once something is done, but in some cases I had multiple separate functions before that and if conditions where the one with res.status never executes in the first place; now double checking that there aren't any other functions like that

- based on choosing list item, display/render appropriate submit page (it displays different page for multi list ones, therefore not a problem)




this all below should only be the case if user is logged in

for anonymous users, no submit draft should be created; therefore,
the first check is whether user is logged in or not

if logged in

else
	please log in if you wish to save your submit as draft and to prevent losing your work




- Custom reuseable function: 
	1. When user writes or adds anything
		1.1 Run function to test if submit id exists
			1.1.1 If true, return as normal
			1.1.2 If false, run function to create submit

remove the single 'link' block, as you can create that with adding a list and only adding one link

- load different draft based on list and its template

- initialize heading inputs
- initialize expandable inputs / q&a + adding new 
- initialize lists, links for list items, adding new list items
- initialize checklists, links for list items, adding new list items

- initialize complex editors
- initialize simple editors (quote, info-box, example-box)

- initialize image uploads
- initialize image title
- initialize image description
- initialize image link
- initiallize entry/submit link


- setup authorization