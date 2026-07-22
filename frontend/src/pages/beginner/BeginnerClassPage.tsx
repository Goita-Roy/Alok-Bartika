import { useParams, Navigate } from "react-router-dom";
import ClassPageLayout from "../../components/beginner-content/ClassPageLayout";
import Section1_Definition from "../../components/beginner-content/Section1_Definition";
import Section1_Definition_02 from "../../components/beginner-content/Section1_Definition_02";
import Section1_Definition_03 from "../../components/beginner-content/Section1_Definition_03";
import Section1_Definition_04 from "../../components/beginner-content/Section1_Definition_04";
import Section1_Definition_05 from "../../components/beginner-content/Section1_Definition_05";
import Section1_Definition_06 from "../../components/beginner-content/Section1_Definition_06";
import Section1_Definition_07 from "../../components/beginner-content/Section1_Definition_07";
import Section1_Definition_08 from "../../components/beginner-content/Section1_Definition_08";
import Section1_Definition_09 from "../../components/beginner-content/Section1_Definition_09";
import Section1_Definition_10 from "../../components/beginner-content/Section1_Definition_10";
import Section2_BrainTeaser from "../../components/beginner-content/Section2_BrainTeaser";
import Section2_BrainTeaser_02 from "../../components/beginner-content/Section2_BrainTeaser_02";
import Section2_BrainTeaser_03 from "../../components/beginner-content/Section2_BrainTeaser_03";
import Section2_BrainTeaser_04 from "../../components/beginner-content/Section2_BrainTeaser_04";
import Section2_BrainTeaser_05 from "../../components/beginner-content/Section2_BrainTeaser_05";
import Section2_BrainTeaser_06 from "../../components/beginner-content/Section2_BrainTeaser_06";
import Section2_BrainTeaser_07 from "../../components/beginner-content/Section2_BrainTeaser_07";
import Section2_BrainTeaser_08 from "../../components/beginner-content/Section2_BrainTeaser_08";
import Section2_BrainTeaser_09 from "../../components/beginner-content/Section2_BrainTeaser_09";
import Section2_BrainTeaser_10 from "../../components/beginner-content/Section2_BrainTeaser_10";
import Section3_RealLife from "../../components/beginner-content/Section3_RealLife";
import Section3_RealLife_02 from "../../components/beginner-content/Section3_RealLife_02";
import Section3_RealLife_03 from "../../components/beginner-content/Section3_RealLife_03";
import Section3_RealLife_04 from "../../components/beginner-content/Section3_RealLife_04";
import Section3_RealLife_05 from "../../components/beginner-content/Section3_RealLife_05";
import Section3_RealLife_06 from "../../components/beginner-content/Section3_RealLife_06";
import Section3_RealLife_07 from "../../components/beginner-content/Section3_RealLife_07";
import Section3_RealLife_08 from "../../components/beginner-content/Section3_RealLife_08";
import Section3_RealLife_09 from "../../components/beginner-content/Section3_RealLife_09";
import Section3_RealLife_10 from "../../components/beginner-content/Section3_RealLife_10";
import Section4_HowItWorks from "../../components/beginner-content/Section4_HowItWorks";
import Section4_HowItWorks_02 from "../../components/beginner-content/Section4_HowItWorks_02";
import Section4_HowItWorks_03 from "../../components/beginner-content/Section4_HowItWorks_03";
import Section4_HowItWorks_04 from "../../components/beginner-content/Section4_HowItWorks_04";
import Section4_HowItWorks_05 from "../../components/beginner-content/Section4_HowItWorks_05";
import Section4_HowItWorks_06 from "../../components/beginner-content/Section4_HowItWorks_06";
import Section4_HowItWorks_07 from "../../components/beginner-content/Section4_HowItWorks_07";
import Section4_HowItWorks_08 from "../../components/beginner-content/Section4_HowItWorks_08";
import Section4_HowItWorks_09 from "../../components/beginner-content/Section4_HowItWorks_09";
import Section4_HowItWorks_10 from "../../components/beginner-content/Section4_HowItWorks_10";
import Section5_Timeline from "../../components/beginner-content/Section5_Timeline";
import Section5_Timeline_02 from "../../components/beginner-content/Section5_Timeline_02";
import Section5_Timeline_03 from "../../components/beginner-content/Section5_Timeline_03";
import Section5_Timeline_04 from "../../components/beginner-content/Section5_Timeline_04";
import Section5_Timeline_05 from "../../components/beginner-content/Section5_Timeline_05";
import Section5_Timeline_06 from "../../components/beginner-content/Section5_Timeline_06";
import Section5_Timeline_07 from "../../components/beginner-content/Section5_Timeline_07";
import Section5_Timeline_08 from "../../components/beginner-content/Section5_Timeline_08";
import Section5_Timeline_09 from "../../components/beginner-content/Section5_Timeline_09";
import Section5_Animation_10 from "../../components/beginner-content/Section5_Animation_10";
import Section6_Game from "../../components/beginner-content/Section6_Game";
import Section6_Game_02 from "../../components/beginner-content/Section6_Game_02";
import Section6_Game_03 from "../../components/beginner-content/Section6_Game_03";
import Section6_Game_04 from "../../components/beginner-content/Section6_Game_04";
import Section6_Game_05 from "../../components/beginner-content/Section6_Game_05";
import Section6_Game_06 from "../../components/beginner-content/Section6_Game_06";
import Section6_Game_07 from "../../components/beginner-content/Section6_Game_07";
import Section6_Game_08 from "../../components/beginner-content/Section6_Game_08";
import Section6_Game_09 from "../../components/beginner-content/Section6_Game_09";
import Section6_Game_10 from "../../components/beginner-content/Section6_Game_10";
import { lessonClasses } from "../../components/beginner-content/lessonConfig";

const classComponents: Record<string, React.FC> = {
  "class-01": () => (
    <ClassPageLayout currentClassId="class-01">
      <Section1_Definition />
      <Section2_BrainTeaser />
      <Section3_RealLife />
      <Section4_HowItWorks />
      <Section5_Timeline />
      <Section6_Game />
    </ClassPageLayout>
  ),
  "class-02": () => (
    <ClassPageLayout currentClassId="class-02">
      <Section1_Definition_02 />
      <Section2_BrainTeaser_02 />
      <Section3_RealLife_02 />
      <Section4_HowItWorks_02 />
      <Section5_Timeline_02 />
      <Section6_Game_02 />
    </ClassPageLayout>
  ),
  "class-03": () => (
    <ClassPageLayout currentClassId="class-03">
      <Section1_Definition_03 />
      <Section2_BrainTeaser_03 />
      <Section3_RealLife_03 />
      <Section4_HowItWorks_03 />
      <Section5_Timeline_03 />
      <Section6_Game_03 />
    </ClassPageLayout>
  ),
  "class-04": () => (
    <ClassPageLayout currentClassId="class-04">
      <Section1_Definition_04 />
      <Section2_BrainTeaser_04 />
      <Section3_RealLife_04 />
      <Section4_HowItWorks_04 />
      <Section5_Timeline_04 />
      <Section6_Game_04 />
    </ClassPageLayout>
  ),
  "class-05": () => (
    <ClassPageLayout currentClassId="class-05">
      <Section1_Definition_05 />
      <Section2_BrainTeaser_05 />
      <Section3_RealLife_05 />
      <Section4_HowItWorks_05 />
      <Section5_Timeline_05 />
      <Section6_Game_05 />
    </ClassPageLayout>
  ),
  "class-06": () => (
    <ClassPageLayout currentClassId="class-06">
      <Section1_Definition_06 />
      <Section2_BrainTeaser_06 />
      <Section3_RealLife_06 />
      <Section4_HowItWorks_06 />
      <Section5_Timeline_06 />
      <Section6_Game_06 />
    </ClassPageLayout>
  ),
  "class-07": () => (
    <ClassPageLayout currentClassId="class-07">
      <Section1_Definition_07 />
      <Section2_BrainTeaser_07 />
      <Section3_RealLife_07 />
      <Section4_HowItWorks_07 />
      <Section5_Timeline_07 />
      <Section6_Game_07 />
    </ClassPageLayout>
  ),
  "class-08": () => (
    <ClassPageLayout currentClassId="class-08">
      <Section1_Definition_08 />
      <Section2_BrainTeaser_08 />
      <Section3_RealLife_08 />
      <Section4_HowItWorks_08 />
      <Section5_Timeline_08 />
      <Section6_Game_08 />
    </ClassPageLayout>
  ),
  "class-09": () => (
    <ClassPageLayout currentClassId="class-09">
      <Section1_Definition_09 />
      <Section2_BrainTeaser_09 />
      <Section3_RealLife_09 />
      <Section4_HowItWorks_09 />
      <Section5_Timeline_09 />
      <Section6_Game_09 />
    </ClassPageLayout>
  ),
  "class-10": () => (
    <ClassPageLayout currentClassId="class-10">
      <Section1_Definition_10 />
      <Section2_BrainTeaser_10 />
      <Section3_RealLife_10 />
      <Section4_HowItWorks_10 />
      <Section5_Animation_10 />
      <Section6_Game_10 />
    </ClassPageLayout>
  ),
};

const validClassIds = lessonClasses.map((c) => c.id);

export { classComponents, validClassIds };

export default function BeginnerClassPage() {
  const { classId } = useParams<{ classId: string }>();

  if (!classId || !validClassIds.includes(classId)) {
    return <Navigate to="/courses/beginner/class-01" replace />;
  }

  const Component = classComponents[classId];
  return <Component />;
}
