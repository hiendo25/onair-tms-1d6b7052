export class OrganizationService {
  async updateOrganization(organizationId: string) {
    try {
      return await fetch("/api/organization");
    } catch (err) {
      console.log(err);
    }
  }
}
