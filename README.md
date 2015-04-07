3D Genome Browser
=================

# Overview

3D Genome Browser is the interactive web-based Genome Browser that allows the user to navigate through the 3D structure of Human Genome in real time, fetching genomic data as well as high-resolution 3D meshes representing the DNA backbone from the server. It runs on most common web browsers (Firefox and Chrome). It is publicly available at http://3dgb.cs.mcgill.ca/.

### Features

The viewer implements multiple features allowing its users to access and visualize Human genome data stored in the database. At the core of 3DGB resides our ability to define and query a 3D neighbourhood, and thus to identify potential spatial relationship between genomic elements. In our viewer, a cursor of points at the centre of a box representing a neighbourhood to be explored. The size of the box is adjustable (by
scrolling up or down), allowing the users to tune the range of spatial relationships. Once a volume has been selected (directly from a query or following an exploration of the genome structure), the user can retrieve and download the list of all SNPs located within that box, or use hyperlinks to directly access detailed information stored on the NCBI databases for each individual SNP. In addition, it is also possible to access the list of all genes present in the query cell.
Alternatively, the users can switch to a linear mode. In that case, the neighbourhood of the query position is defined as a sequence interval. It is equivalent to the viewing frame used in classical (i.e. one dimensional) genome browsers. This mode also allows the users to retrieve all SNPs present in this 1D neighbourhood.
The third mode enables the users to highlight transcription factor binding sites in the viewer. TFBSs are represented as coloured regions of the DNA chain. The colour indicates the intensity of the Chip-Seq experiment (green for low to red for high). The user can access detailed information about the Chip-Seq data by clicking on the TFBS region, or access UCSC genome browser records through an hyperlink.
Finally, we implemented a distance calculation tool that enables the users to automatically determine the physical distance between two points in space. We intentionally did not used physical units, but instead rely on the model coordinates. Indeed, the determination of physical distances require to interpret experimental data and make approximations which are often subject of discussions. By contrast, we believe that arbitrary units allows the users to estimate relative differences and leave them the freedom to interpret the experimental data used to obtain the 3D model.

An important feature of our viewer is to enable users to map their private genotyping data onto reference 3D architectures, and allow them to visualize the data within our browser. This functionality is intended to provide users with tools to identify geometrical dependencies in custom genotyping data sets. The query interface allows users to upload a local file containing genotyping data. In order to prevent any formatting issues, we implemented a program to validate and convert most standard genotyping data file.
Once uploaded, the users can browse and query the 3D genome as described above. In addition to the reference data stored in our database, the users can now access simultaneously the reference SNPs collected from together with those stored in the local file. To prevent any privacy issues, user data are stored locally and not transmitted to our server. A similar solution has been adopted by the UCSC genome browser.


# Structure

This project is built on dynamic Javascript with a help of [Three.js](http://threejs.org/). Most part of the work with 3D entities and visualization of genome has been done in js/3DGB_Engine.js. The operating loop is located in animate() function.
In fact, our server side is built on the NoSQL Database and, thus, biggest part of the script processes asynchronous server responses.
Another sufficient part of the script is approximation and interpolation of 3D model of human genome. It is represented as a finite set of points and resolution is fully depends on the chosen structure.

Also our 3D Genome Browser uses [Genome Maps](http://www.genomemaps.org/) as a external tool for simplification of navigation among the genome. It is also web-based system and could be easily integrated into such big system as 3D Genome Browser. Connection between two browsers has been implemented with help of HTML5 technology: [window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). It allows the user to change position in one browser and to see the result of this change in another browser. Integrated and modified Genome Maps system you can find in genome-maps-v3.0.0 folder.

Note: This repository contains only client part.

You can report bugs or request new features at [GitHub issue tracking](https://github.com/mavlyutovrus/3d_genome_browser/issues).

### Maintainers

We recommend to contact 3D Genome Browser developers by emailing to alexander.butyaev@mail.mcgill.ca. The main developers and maintainers are:
* Alexander Butyaev (alexander.butyaev@mail.mcgill.ca)
* Ruslan Mavlyutov (ruslan@exascale.info)


##### Other Contributors

* Jérôme Waldispühl (jeromew@cs.mcgill.ca)
* Philippe Cudre-Mauroux (phil@exascale.info)


##### Contributing

3D Genome Browser is an open-source and collaborative project. We appreciate any help and feedback from users. You can contribute in many different ways such as simple bug reporting and feature request. Dependending on your skills you are more than welcome to develop new features or even fixing bugs.

# How to build and run

3D Genome Browser is mainly developed in Javascript and it contains all the files, which are required for work.
For stable work it also requires compatible Web Browser (Google Chrome or Firefox) and an access to the Internet. For better user experience we recommend use Google Chrome.

### Cloning

3D Genome Browser is an open-source and free project, you can download **_develop_** branch by executing:
	git clone https://github.com/mavlyutovrus/3d_genome_browser.git


