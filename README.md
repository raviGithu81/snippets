# Fluid Framework

The main tech stack used in this project is Shopify, Javascript & Bootstrap5

## Project setup

Project setup instructions are available [here](https://docs.google.com/document/d/1NyaQ0VCqsvz6EVSYiBubibvVG2eJQDpNVcK3MWGefTg/edit#)

## Requirements

- Git 2.37.1 or higher
- Shopify CLI 2.20.1 or higher

## Technologies

- [Git](https://git-scm.com/)
- [Shopify](https://shopify.dev/)
- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/)

## Build concepts ##

- [Online Store 2.0](https://www.shopify.com/partners/blog/shopify-online-store)
- [Sections everywhere](https://shopify.dev/themes/architecture/sections)
- [Pinned Metafields](https://help.shopify.com/en/manual/metafields/displaying-metafields-on-your-online-store)
- [App Blocks](https://shopify.dev/apps/online-store/theme-app-extensions/extensions-framework)
- [Storefront Filtering](https://shopify.dev/themes/navigation-search/filtering)
  
## Handy Links

Some of the useful links which are helpful in base theme preview / understanding & quality production.

- Base Theme: [Fluid Framework 2.0](https://demo-dawn-vibha.myshopify.com/) (store pass: letmein)
- Base Theme Docs: [Documentation](https://docs.google.com/document/d/1K4h5TH1OA9k3mF8GGufya8d_cHschd4M/edit?usp=sharing&ouid=108008958850764968571&rtpof=true&sd=true)
- Snippet Library: Pre build Code Snippets available [here](https://snippet-library.myshopify.com/) |

## Getting Started

### 1. Clone the repository

The first step is cloning this repository into your development environment. This repo uses Git Flow strategy to work with branches.

Git flow is a popular Git branching strategy aimed at simplifying release management that involves isolating your work into different types of Git branches.

### 2. Installation

**Shopify CLI**

You will need to install the Shopify CLI on your machine:

- [CLI Installation](https://shopify.dev/themes/tools/cli/installation)
- [CLI Docs](https://shopify.dev/themes/tools/cli)
- [Theme commands](https://shopify.dev/themes/tools/cli/theme-commands)

> __Note:__ This is a Shopify 2.0 build so do not use Theme Kit.

### 3. Running a development environment

To run a development enviornment you will need to have the Shopify CLI running.

**Init shopify theme on local**

The first time you want to interact with a store using a shopify theme command, you need to pass the `--store` flag with your command. The store that you specify is used for future commands until you pass the `--store` flag with a new value.

```bash
shopify theme dev -s=STORE_NAME
```

**GIT branch pull**

Next, pull down the main branch files (or any branch) that you want to work on to your machine :

```bash
git pull origin BRANCH_NAME
```

> __Note:__ Even though you may already have the most recent theme files from the repository there may have been changes made in the Shopify Theme Editor (the Shopify admin) that you need to roll into your local files before writing new code. It is suggested that you always pull files first to get synced up before starting new development tasks.


**Start**

Serve theme files from your local to Shopify temporary theme.

> __Note:__  If while you are working you make any changes to your temporary development theme directly through the Shopify Theme Editor (the Shopify admin) you will need to be sure you pull down those changes and commit them into the theme files so they do not get lost. To do this first commit any other local changes. Then, run `shopify theme pull` and select the development theme to grab the files you just made changes in. This will pull down the json changes made in the Shopify Theme Editor (ex: settings_data.json) so that you can commit those changes to version control.

### 4. Branches

**Main branches**

- `main` is the default branch, used to contain production-ready code that can be released.

- `staging` is the merchant preview branch, is created once the development process is complete, and contains production code with newly developed features that are in the process of being tested.
  
- `development` is the development branch, is created at the start of a project and is maintained throughout the development process, and contains pre-production code with newly developed features that are in the process of being tested. Newly-created features should be based off the develop branch, and then merged back in when ready for testing.

**Branch types**

- `New feature`
- 

**Branch name**

When you start the development, you should create a branch from main, and must name your branch following the pattern:

```bash
TYPE/pra-XXXX
```

Example:
```bash
feature/pra-1234
```

Example of branch creation:
```bash
# Step 1: Go to main
git checkout main

# Step 2: Pull updates
git pull origin main

# Step 4: Create your branch
git checkout -b 'feature/pra-1234'
```

### 5. Commiting the changes

**Commit your changes**

We are registering the commits for each task in PATH which later can be used for code review and track progress. You should use the following commit message pattern:

```bash
Your commit message here #PATH TASK ID
```

Example:
```bash
Add Header component #1234
```

**Push to repository**

After committing, you will be able to push your changes to the repository.

### 6. Pull requests

After the validation, you should create a Pull Request to staging branch.

**PR creation**

A pull request – also referred to as a merge request – is an event that takes place in software development when a contributor/developer is ready to begin the process of merging new code changes with the main project repository.

This PR could be created at GitHub.

**Code review**

The PR needs approval from technical lead to be considered approved. For smaller changes this step can be skipped but for bigger components like new feature development or global fixes this is compulsary.

### 7. Merge

After the PR approbation, you could start the merge process. Your branch must be merged into the staging branch.

```bash
# Step 1: Go to staging branch
git checkout staging

# Step 2: Pull staging updates
git pull

# Step 3: Pull Shopify theme updates (Select Staging environment)
shopify theme pull

# Step 4: Merge your branch into staging
git merge 'feature/pra-1234'

# Step 5: Resolve conflicts, if any
git status

# Step 6: Add changes to the commit
git add .

# Step 7: Commit the merge
git commit

# Step 8: Push the changes
git push

# Step 9: Push theme changes (Select Staging environment)
shopify theme push

```


## Theme Preservation

All script tags needs tbe in inside `snippets/script-tags.liquid`

__Example Snippet:__

```
/snippets/template-upsell.liquid
```

## Styles & Scripts inclusion

In the spirit of preserving the base theme, styling & script files naming structure and placement must be followed for all newly created assest

- Global sections or features: This must be included within the section liquid file as inclusion of these sections are dynamic and can be controlled through customization. Naming Convention: ```global-section_name.css``` OR ```global-feature_name.js```. For the JS file this can be added directly in ```script-tags.liquid``` snippet as well for one-time inclusion.

- Static sections: This can be included in sections file as well as in ```style-tags.liquid``` snippet. Naming Convention: ```static-section_name.css```.

- Template styling & scripts: Styling for Product / Collection / Cart / 404 / Blog / Article / List Collection / Account and other Pages are part of template Styling. The CSS and JS files are included in ```style-tags.liquid``` and ```script-tags.liquid``` snippets respectively using conditional rendering. Naming Convention: ```template-template_name.css``` OR ```template-template_name.js```

- Component styling & scripts: CSS blocks for Components like Slider, Pagination, product card etc. are situated at ```style-tags.liquid``` snippet. with naming Convention such as ```component-component_name.css```. For feature components like quickshop, filters, sticky header etc. are situated at ```script-tags.liquid``` snippet with naming convention such as ```component-component_name.js```. 


## CodeStyle

It's recommended the vscode plugin Shopify.theme-check-vscode (Shopify Liquid extension). The Shopify Liquid extension includes the Shopify Liquid Prettier Plugin by default.

## Additional Notes

- Install `ESLint` extension in `Visual Studio Code` [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
## Contributing

- Follow [Postmortem checklist](https://docs.google.com/document/d/1k5u9y3coz9S53tWlzjzgYYw_j37tE7lHtOU-7Jdkvqs/edit#) for each deployment to maintain code quality.

- Developer QA is must in Chrome/Safari/Firefox browsers and Desktop/Tablet/Mobile(Android & IOS) devices.

- Avoid adding/keeping unnecessary code in theme to prevent complexity.
