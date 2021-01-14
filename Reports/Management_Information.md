# Initial Project Plan/Management Information 

## Overview 

The following sections provide some details on our plans and motivations for our project. At this stage, some of the subjects discussed below may be out of scope before our API module is completed. However, this initial plan will assist us in setting more specific goals and guiding us in a direction we aim to go in.


## Timeline and Deadlines 

Week 1:


    ·  	Make Groups

Week 2:<sup>2</sup>


    ·  	Set up Github for team


    ·  	Decide on work arrangement for each member


    ·  	Start making web scraper to scrape Global Incident Map (data source)


    ·  	Work on API design for D1


    ·  	Decide on database schema design


    ·  	Define interface/specification between database queries and the API module

Week 3:<sup>3 </sup> - D1 due.


    ·  	Start researching for frontend (wireframe) designs for the client side of the project roughly 


    ·  	Set up the database according to schema design


    ·  	Finish and automate regular web scraping and data collection


    ·  	Make automated data cleansing program


    ·  	Continue to work on API module


    ·  	Start writing test scripts and testing API module


    ·  	Finalise everything required for D1

Week 4:<sup>4</sup>


    ·  	Finalise and deploy API


    ·  	Finish testing and documenting on API


    ·  	Discuss features and write up user stories for the client side of the project


    ·  	Finish designing and prototyping frontend (wireframe) draft according to user stories

Week 5:<sup>5</sup> - D2 API specification URL due.


    ·  	Try to finalise everything required for D2


    ·  	Start discussing the client side of the project e.g. defining the interface between the GUI and logic


    ·  	Improve the frontend prototype (wireframe) by reviewing and surveying potential users if possible

Week 6:<sup>6 </sup>- D2 due.


    ·  	Implement the frontend prototyped design in code


    ·  	Start making calls to grab data from different APIs on the client side

Week 7:<sup>7</sup>


    ·  	As a team, plan and practice the demonstration for D3


    ·  	Complete a basic, working prototype in code (with real data)


    ·  	Start planning and implementing extension feature(s)

Week 8:<sup> </sup>- D3.


    ·  	Continue working on extension feature(s)

Week 9:


    ·  	Continue working on extension feature(s)

Week 10: Project (D4) Due

 <sup>2</sup> To start off, we need to discuss the main roles of each team member.  To do this, we need to find out the strengths and weaknesses of each member in regards to software development so that each member can be tasked accordingly for maximum efficiency and quality of work.  We also need to start working on web scraping our data source as this is one of the basic building blocks of our project (where some of the data will come from).  D1 is due at the end of week 3 so we will start working on API design and other documentation required as soon as possible.  We will also try to decide on a database schema design in week 2 so the database can be set up in week 3.

<sup>3</sup> We will try to finish web scraping our data source by the end of week 3 so that the API module has access to some real web scraped data as soon as possible. Furthermore, our web scraper and data cleansing will be automated so that it can automatically scrape the website and update the data in the database on a regular basis. Work on the API module will begin at the latest by the end of week 3 as we will need a working API before we can completely move on to the next stage of our project (the client side).  \
For the website on the client side (second stage of our project), our goal is to create a very user-friendly website that is specific to its target audience (School of Public Health Professionals). Therefore, we plan to invest a lot of time into the designing and prototyping the website.  As a result, our front end team will begin researching and drafting designs for the front end of the client side as early as week 3.

 

<sup>4 </sup>For week 4, we will try to finalise the API so that we have ample time to code the client side of our project.  We will be documenting and testing our API simultaneously. Ideally all the documentation and test scripts for the API should be completed when the API is finalised.   \
Designs and prototypes for the frontend of the client side will continue in week 4 to try and achieve a more or less finished prototype/wireframe by the end of the week.

 

<sup>5 </sup>In week 5, we will aim to have all of deliverable 2 (D2) finished. This will include API testing, documentation, implementation and specification.  With the API finished, we will begin discussing the client side of our project (the website) so that we can start working on it.   \
We also plan to review the frontend design/wireframe of our website at this stage by checking the design ourselves, getting feedback from our mentor and if possible surveying and getting feedback from our target audience; School of Public Health Professionals so that we can best improve it to suit our users.

 

<sup>6 </sup>For our website (the client side of the project), the group will split into the frontend user interface and backend logic subteams for week 6 to work on their separate parts of the project.  The frontend team will start implementing the prototype devised in previous weeks, while the backend team will work on getting data from multiple APIs.

 

<sup>7 </sup>We have two main tasks in week 7: having a functional website and planning and practicing for our demonstration/presentation for deliverable 3 (D3).  If we have time, we will also start planning out the extension features for our project so that we have enough time to implement them in the final few weeks before the project is due.


## Team Work Arrangement and Responsibilities 

 

**Andy** will mainly be designing, creating the skeleton structure of the API, testing and overseeing the whole process of developing the API. He is the member with the most theoretical knowledge and practical experiences in making APIs so taking on a lead role in the API component of the project will greatly guide our team in working towards a clearer goal, completing our tasks more efficiently. Due to this, Andy is also assigned as our project manager in our agile mythology that we adopted and will also be working on coding up the backend logic for the client side of the project (the website). 

**Tammy** will be assisting Andy in designing and developing the API module as a new learning experience. She will also be writing up the documentation for our code due to her previous experiences with documentations through various group projects where she documented, structured and formatted reports and codes.  \
With some experiences and passion in designing and producing user-friendly user interfaces for similar projects, she will be taking lead in facilitating the creation of user stories for the client side of the project as well as be heavily involved with the design and code for the frontend of the client side (website) in this project. 

**Wilson** will be assisting with coding the API and creating the database queries for the API module to access our database as a new learning experience.  \
He will also be working on developing logic of the client side (website) for this project due to his familiarity with backend coding through other similar projects. In scrum terminology, Wilson will be the SCRUM Master to oversee the work in each sprint. 

**Jacky** will be creating/setting up the database to store all the necessary information due to his familiarity with databases.   \
He will also be helping with the frontend of the client side for this project as he has had experience in frontend coding from previous software projects.

**Marshall** is tasked with developing the web scraping and data cleansing for this project as he has had prior experience and knowledge in web scraping.   \
He will also be working on the frontend of the client side  for this project as he has been involved in frontend developments in previous software projects. 


## Software Engineering and Agile Strategies 

Rather than strictly following a traditional waterfall model, we have adapted different software engineering methodologies to suit this project and our team. We have adopted some agile principles/strategies and incorporated it into the way we scheduled our timeline and delegated our work which will further be explained below. 

Similar to SCRUM, our agile methodologies focus on the continuous and frequent delivery of useful software. This can be seen as something that we are moving towards when scheduling our timeline under the strict deadlines as well as in the way we are planning to work as a team. We are continuously aiming to deliver working software components/modules (e.g. API module, database queries, scraper etc.) that can somewhat work independently. By clearly dividing the components/modules and defining the interfaces between each, we are working together in a way where it does not depend on one module to finish to move onto another and members can go off to work on components individually or in subteam and come back together to make clarifications. 

Due to the fast-paced progressions and strict deadlines we have in this project, we have decided to set each sprint to be a week long. We will be holding regular stand-up/face-to-face meetings to conduct our sprint planning review, sprint review and a retrospective of our progress. We agreed that it would be more often than a weekly meeting but due to time constraints and other commitments, weekly meetings seem to be the most suitable for everyone.

Furthermore, we have adopted the idea of user stories from Agile methodologies where the user is prioritised and we will be formatting our features in term of user stories. 

Some strategies we have retained from the traditional waterfall model which we believe are beneficial to this project include putting some focus on documentation, keeping the overall structure of the project linear where there are stages of the project to proceed onto as the scope of the project is mostly known and doing so allows us to better keep track of our progress.

## Software Project Management

In order to better manage our team collaboration and prevent too many problems when integrating parts of our software together. We have defined a 4-step procedure to "deploy" components of our software to the master branch of our repository. This procedure is not explicitly stated/reflected on our timeline above but it will be conducted informally on a regular basis whilst we are each working on our software components.


<table>
  <tr>
   <td>Step
   </td>
   <td>Environment
   </td>
   <td>Description
   </td>
  </tr>
  <tr>
   <td>1
   </td>
   <td>Development
   </td>
   <td>Developer will develop independently in their local workstation/workspace. Each developer will have a copy of the latest version of the source code. In this stage, basic unit testing might be done by the developer themselves. 
   </td>
  </tr>
  <tr>
   <td>2
   </td>
   <td>Integration
   </td>
   <td>Developer integrates their work with others via GitHub repository. All developer can look at each other's work at anytime and request for their code. 
   </td>
  </tr>
  <tr>
   <td>3
   </td>
   <td>Testing
   </td>
   <td>An assigned tester checks and test new code by performing automated script testing or interface testing. 
   </td>
  </tr>
  <tr>
   <td>4
   </td>
   <td>Deployment
   </td>
   <td>Changes that are approved from testing stage will be deployed.
   </td>
  </tr>
</table>


Some improvements to our current deployment procedure would be integrating with third-party softwares to improve our integration and deployment procedures at a more efficient rate. Third-party softwares such as NOW by Zeit allows an automatic deployment on every push and pull requests and Koding allows for quick management of deployment. 

However, after a some discussion with the team, we believe that although these are very valuable tools for large projects but with the time and scale of our project, the team feels that these additions would not be necessary and could potentially become a risk and cause more problems as no one in the team has had experiences in using them.

## Communication Platforms and Tasking Tools (to assist project management) 

The team will be communicating via various platforms. We will be exchanging text messages through **Facebook Messenger** for meeting plans, small issues and clarifications. 

There are face-to-face and/or online meetings on a weekly basis with the team mainly to update the team on what each of us have been working on, discuss what there is to be done by each member and the team in the coming week, any major problems we have encountered related to the project in the past week and any important issues/questions that we need to ask or clarify with our mentor in our next mentor meeting. Face-to-face meetings are conducted **on campus** whilst online meetings will be through a group call on **Discord**.  

We will be using our **Github** repository to work together on coding our project, maintaining different versions of our code and having backups.

To keep track and work on documentations simultaneously with other members in the team, we have a shared folder **Google Drive** where the work is completed and transferred to Github. Currently in this drive we have summaries of what we discussed in every group meeting, specifications for our API and all other necessary project documentation for deliverable 1 (D1).

We will be using a **Trello** board to clearly plan out all the tasks that need to be completed as we believe that this will not only make it easier/clearer for us to keep track and delegate tasks to each team member but also give our team a better visualisation/overview of our progress and a better indication of whether we are ahead of or behind schedule.

Link: [https://trello.com/invite/b/TBMBC5gJ/25365b35c54e2761f9cc1e3f96f0137a/seng3011](https://trello.com/invite/b/TBMBC5gJ/25365b35c54e2761f9cc1e3f96f0137a/seng3011)

