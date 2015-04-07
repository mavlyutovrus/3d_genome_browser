public static void main(String[] args) throws IOException {
		
		ASs ass = new ASs();
		HashMap<String, ArrayList<String>> hmap = new HashMap<String, ArrayList<String>>();
		HashMap<String, String> sourceMap = new HashMap<String, String>();
		String folderPath = "HERE IS AFOLDER absolute PATH";
		String problemName = "COMP251HW1"; //PROBLEM/FILE NAME (you shouldn't consider any file that has wrong naming)
		File folder = new File(folderPath);
		File[] filesArray = folder.listFiles(new FileFilter() {
			public boolean accept(File pathname) {
				if (pathname.getName().toLowerCase().endsWith(".java") && pathname.getName().toLowerCase().endsWith(problemName.toLowerCase())) {
					return true;
				}
				return false;
			}
		});
		int k = 0, p = 0;
		for (File file: filesArray) {
			System.out.println(file.getName());			
			k++;
			String folderName = file.getName().replaceAll("^[\\d]+-[\\d]+\\s*-\\s*(.+)\\s+-\\s*[A-Z][a-z]{2}\\s*[\\d]+,\\s*[\\d]+\\s*[\\d]+\\s*[AMP]{2}\\s*-*.*\\.java$", "$1");
			
			Scanner sc = new Scanner(file);
			String tempLine;
			ArrayList<String> studentGroup = new ArrayList<String>();
			boolean isStarted = false;
			while (sc.hasNextLine()) {
				tempLine = sc.nextLine();
				
				if (tempLine.contains("class")/* || tempLine.contains("package") */) {
					if (isStarted) { //already finished - we can use name into the file
//						hmap.put(folderName, studentGroup);
//						sourceMap.put(key, value)
						for (String studentString : studentGroup) {
							hmap.put(studentString, studentGroup);
							sourceMap.put(studentString, "src/heap/"+folderName.replaceAll("\\s", "_").replaceAll("-", "__"));
							p++;
						}
					}
					else { //haven't started yet - no name in files - alone.
						studentGroup.add(folderName);
						hmap.put(folderName,studentGroup);
						sourceMap.put(folderName, "src/heap/"+folderName.replaceAll("\\s", "_").replaceAll("-", "__"));
						p++;
					}
					break;
				} else if (tempLine.toLowerCase().matches("([/]{2}|[\\*])\\s*student[\\d_]*name.+") ) {
					studentGroup.add(tempLine.replaceAll("(?i)([/]{2}|[\\*])\\s*student[\\d_]*name[^a-z]*(([a-z]+\\s*){1,5})", "$2"));
					isStarted = true;
				} else if (tempLine.toLowerCase().matches("\\s*([/]{2}|[\\*])\\s*([a-zA-Z]+\\s*){1,4}\\s*") 
						&& !tempLine.toLowerCase().contains("university") 
						&& !tempLine.toLowerCase().contains("blanchette")
						&& !tempLine.toLowerCase().contains("import")) {
					studentGroup.add(tempLine.replaceAll("(?i)\\s*([/]{2}|[\\*])\\s*(([a-z]+\\s*){1,5})", "$2"));
					isStarted = true;
				}
			}
		}
		
		File newFile;
		String temp;
		for (File file : filesArray) {
			String folderName = file.getName().replaceAll("^[\\d]+-[\\d]+\\s*-\\s*(.+)\\s+-\\s*[A-Z][a-z]{2}\\s*[\\d]+,\\s*[\\d]+\\s*[\\d]+\\s*[AMP]{2}\\s*-.*\\.java$", "$1");
			newFile = new File("src/heap/" + folderName.replaceAll("\\s", "_").replaceAll("-", "__"));
			if (!newFile.exists()) newFile.mkdir();
			newFile =  new File("src/heap/" + folderName.replaceAll("\\s", "_").replaceAll("-", "__") + "/" + problemName + ".java");
			FileWriter fw = new FileWriter(newFile);
//			fw.append("package heap." + folderName.replaceAll("\\s", "_") + "." + problemName + ";\n");
			Scanner sc = new Scanner(file);
			fw.append("package heap.").append(folderName.replaceAll("\\s", "_").replaceAll("-", "__")).append(";\n");
			while (sc.hasNextLine()) {
				temp = sc.nextLine();
				if (temp.trim().startsWith("package")) continue;
				else fw.append(temp).append("\n");
			}
			fw.flush();
			fw.close();
			
			sc.close();
		}
		
	}