import studyService, { MemberResponse } from '../../../api/studyService';
import { MemberProfile } from '../types/memberTypes';

/**
 * Fetch real member data from API and merge with section props
 */
export async function fetchAndMergeMembersData(
  studyId: string, 
  sectionMembers?: any[]
): Promise<MemberProfile[]> {
  try {
    // Fetch real member data from API
    const response = await studyService.getStudyMembers(studyId, 0, 50);
    const realMembers = response.content;
    
    // If no section members provided, create from API data
    if (!sectionMembers || sectionMembers.length === 0) {
      return realMembers.map((member: MemberResponse) => ({
        id: member.id,
        name: member.userId, // Use userId as display name
        role: mapRole(member.role),
        imageUrl: `/images/avatars/avatar-${Math.floor(Math.random() * 10) + 1}.svg`,
        tagline: '',
        joinDate: member.joinedAt,
        isActive: member.status === 'ACTIVE',
        badges: mapBadges(member),
        // Study specific fields
        studyContribution: undefined,
        socialLinks: undefined,
        stats: undefined
      }));
    }
    
    // Merge section data with real API data
    return sectionMembers.map(sectionMember => {
      const realMember = realMembers.find((rm: MemberResponse) => 
        rm.userId === sectionMember.name ||
        rm.id === sectionMember.id
      );
      
      if (realMember) {
        // Merge real data with section data, section data takes precedence for display fields
        return {
          ...sectionMember,
          id: realMember.id,
          isActive: realMember.status === 'ACTIVE',
          joinDate: realMember.joinedAt || sectionMember.joinDate,
          // Keep section's imageUrl if provided, otherwise use default avatar
          imageUrl: sectionMember.imageUrl || `/images/avatars/avatar-${Math.floor(Math.random() * 10) + 1}.svg`,
          // Update role if not specifically set in section
          role: sectionMember.role || mapRole(realMember.role)
        };
      }
      
      // Return section member as-is if no matching real member found
      return sectionMember;
    });
  } catch (error) {
    console.error('Failed to fetch member data:', error);
    // Return section members as fallback
    return sectionMembers || [];
  }
}

function mapRole(apiRole: string): string {
  const roleMap: { [key: string]: string } = {
    'OWNER': '스터디 리더',
    'MANAGER': '매니저',
    'MEMBER': '멤버',
    'ADMIN': '관리자'
  };
  return roleMap[apiRole] || apiRole;
}

function mapBadges(member: MemberResponse): any[] {
  const badges = [];
  
  if (member.role === 'OWNER') {
    badges.push({
      type: 'leader',
      label: '리더',
      icon: '👑'
    });
  }
  
  if (member.role === 'MANAGER') {
    badges.push({
      type: 'manager',
      label: '매니저',
      icon: '⭐'
    });
  }
  
  // Note: attendanceRate not available in MemberResponse
  // Could be added in the future if API provides this data
  
  return badges;
}