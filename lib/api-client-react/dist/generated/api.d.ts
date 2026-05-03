import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ActivityItem, AssignLawyerBody, AuditLogListResponse, Case, CaseDetail, CaseFile, CaseListResponse, CaseNote, CreateCaseBody, CreateHearingBody, CreateMessageBody, CreateNoteBody, DashboardStats, GetRecentActivityParams, GetUpcomingHearingsParams, HealthStatus, Hearing, HearingWithCase, ListAuditLogsParams, ListCasesParams, ListUsersParams, Message, TimelineEntry, UpdateCaseBody, UpdateHearingBody, UpdateProfileBody, UpdateRoleBody, UpdateStatusBody, UpdateUserBody, UploadCaseFileBody, UserListResponse, UserProfile } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current user profile
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<UserProfile>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user profile
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update current user profile
 */
export declare const getUpdateProfileUrl: () => string;
export declare const updateProfile: (updateProfileBody: UpdateProfileBody, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<UpdateProfileBody>;
export type UpdateProfileMutationError = ErrorType<unknown>;
/**
 * @summary Update current user profile
 */
export declare const useUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, {
        data: BodyType<UpdateProfileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, {
    data: BodyType<UpdateProfileBody>;
}, TContext>;
/**
 * @summary List all users (admin only)
 */
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<UserListResponse>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/auth/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users (admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get user by ID
 */
export declare const getGetUserByIdUrl: (id: string) => string;
export declare const getUserById: (id: string, options?: RequestInit) => Promise<UserProfile>;
export declare const getGetUserByIdQueryKey: (id: string) => readonly [`/api/auth/users/${string}`];
export declare const getGetUserByIdQueryOptions: <TData = Awaited<ReturnType<typeof getUserById>>, TError = ErrorType<void>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserByIdQueryResult = NonNullable<Awaited<ReturnType<typeof getUserById>>>;
export type GetUserByIdQueryError = ErrorType<void>;
/**
 * @summary Get user by ID
 */
export declare function useGetUserById<TData = Awaited<ReturnType<typeof getUserById>>, TError = ErrorType<void>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update user (admin only)
 */
export declare const getUpdateUserUrl: (id: string) => string;
export declare const updateUser: (id: string, updateUserBody: UpdateUserBody, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UpdateUserBody>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
 * @summary Update user (admin only)
 */
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        id: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    id: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
/**
 * @summary Delete user (admin only)
 */
export declare const getDeleteUserUrl: (id: string) => string;
export declare const deleteUser: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: string;
}, TContext>;
export type DeleteUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUser>>>;
export type DeleteUserMutationError = ErrorType<unknown>;
/**
 * @summary Delete user (admin only)
 */
export declare const useDeleteUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUser>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUser>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Update user role (admin only)
 */
export declare const getUpdateUserRoleUrl: (id: string) => string;
export declare const updateUserRole: (id: string, updateRoleBody: UpdateRoleBody, options?: RequestInit) => Promise<UserProfile>;
export declare const getUpdateUserRoleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: string;
        data: BodyType<UpdateRoleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: string;
    data: BodyType<UpdateRoleBody>;
}, TContext>;
export type UpdateUserRoleMutationResult = NonNullable<Awaited<ReturnType<typeof updateUserRole>>>;
export type UpdateUserRoleMutationBody = BodyType<UpdateRoleBody>;
export type UpdateUserRoleMutationError = ErrorType<unknown>;
/**
 * @summary Update user role (admin only)
 */
export declare const useUpdateUserRole: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserRole>>, TError, {
        id: string;
        data: BodyType<UpdateRoleBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUserRole>>, TError, {
    id: string;
    data: BodyType<UpdateRoleBody>;
}, TContext>;
/**
 * @summary List all lawyers (for assignment)
 */
export declare const getListLawyersUrl: () => string;
export declare const listLawyers: (options?: RequestInit) => Promise<UserProfile[]>;
export declare const getListLawyersQueryKey: () => readonly ["/api/auth/lawyers"];
export declare const getListLawyersQueryOptions: <TData = Awaited<ReturnType<typeof listLawyers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLawyers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLawyers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLawyersQueryResult = NonNullable<Awaited<ReturnType<typeof listLawyers>>>;
export type ListLawyersQueryError = ErrorType<unknown>;
/**
 * @summary List all lawyers (for assignment)
 */
export declare function useListLawyers<TData = Awaited<ReturnType<typeof listLawyers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLawyers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List cases
 */
export declare const getListCasesUrl: (params?: ListCasesParams) => string;
export declare const listCases: (params?: ListCasesParams, options?: RequestInit) => Promise<CaseListResponse>;
export declare const getListCasesQueryKey: (params?: ListCasesParams) => readonly ["/api/cases", ...ListCasesParams[]];
export declare const getListCasesQueryOptions: <TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<unknown>>(params?: ListCasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCasesQueryResult = NonNullable<Awaited<ReturnType<typeof listCases>>>;
export type ListCasesQueryError = ErrorType<unknown>;
/**
 * @summary List cases
 */
export declare function useListCases<TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<unknown>>(params?: ListCasesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary File a new case
 */
export declare const getCreateCaseUrl: () => string;
export declare const createCase: (createCaseBody: CreateCaseBody, options?: RequestInit) => Promise<Case>;
export declare const getCreateCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
        data: BodyType<CreateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
    data: BodyType<CreateCaseBody>;
}, TContext>;
export type CreateCaseMutationResult = NonNullable<Awaited<ReturnType<typeof createCase>>>;
export type CreateCaseMutationBody = BodyType<CreateCaseBody>;
export type CreateCaseMutationError = ErrorType<unknown>;
/**
 * @summary File a new case
 */
export declare const useCreateCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, {
        data: BodyType<CreateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCase>>, TError, {
    data: BodyType<CreateCaseBody>;
}, TContext>;
/**
 * @summary Get case details
 */
export declare const getGetCaseByIdUrl: (id: string) => string;
export declare const getCaseById: (id: string, options?: RequestInit) => Promise<CaseDetail>;
export declare const getGetCaseByIdQueryKey: (id: string) => readonly [`/api/cases/${string}`];
export declare const getGetCaseByIdQueryOptions: <TData = Awaited<ReturnType<typeof getCaseById>>, TError = ErrorType<void>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseById>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseByIdQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseById>>>;
export type GetCaseByIdQueryError = ErrorType<void>;
/**
 * @summary Get case details
 */
export declare function useGetCaseById<TData = Awaited<ReturnType<typeof getCaseById>>, TError = ErrorType<void>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseById>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update case
 */
export declare const getUpdateCaseUrl: (id: string) => string;
export declare const updateCase: (id: string, updateCaseBody: UpdateCaseBody, options?: RequestInit) => Promise<Case>;
export declare const getUpdateCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
        id: string;
        data: BodyType<UpdateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
    id: string;
    data: BodyType<UpdateCaseBody>;
}, TContext>;
export type UpdateCaseMutationResult = NonNullable<Awaited<ReturnType<typeof updateCase>>>;
export type UpdateCaseMutationBody = BodyType<UpdateCaseBody>;
export type UpdateCaseMutationError = ErrorType<unknown>;
/**
 * @summary Update case
 */
export declare const useUpdateCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCase>>, TError, {
        id: string;
        data: BodyType<UpdateCaseBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCase>>, TError, {
    id: string;
    data: BodyType<UpdateCaseBody>;
}, TContext>;
/**
 * @summary Archive/delete case (admin only)
 */
export declare const getDeleteCaseUrl: (id: string) => string;
export declare const deleteCase: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteCaseMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
    id: string;
}, TContext>;
export type DeleteCaseMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCase>>>;
export type DeleteCaseMutationError = ErrorType<unknown>;
/**
 * @summary Archive/delete case (admin only)
 */
export declare const useDeleteCase: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCase>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCase>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Update case status
 */
export declare const getUpdateCaseStatusUrl: (id: string) => string;
export declare const updateCaseStatus: (id: string, updateStatusBody: UpdateStatusBody, options?: RequestInit) => Promise<Case>;
export declare const getUpdateCaseStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCaseStatus>>, TError, {
        id: string;
        data: BodyType<UpdateStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCaseStatus>>, TError, {
    id: string;
    data: BodyType<UpdateStatusBody>;
}, TContext>;
export type UpdateCaseStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateCaseStatus>>>;
export type UpdateCaseStatusMutationBody = BodyType<UpdateStatusBody>;
export type UpdateCaseStatusMutationError = ErrorType<unknown>;
/**
 * @summary Update case status
 */
export declare const useUpdateCaseStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCaseStatus>>, TError, {
        id: string;
        data: BodyType<UpdateStatusBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCaseStatus>>, TError, {
    id: string;
    data: BodyType<UpdateStatusBody>;
}, TContext>;
/**
 * @summary Assign lawyer to case (admin only)
 */
export declare const getAssignLawyerUrl: (id: string) => string;
export declare const assignLawyer: (id: string, assignLawyerBody: AssignLawyerBody, options?: RequestInit) => Promise<Case>;
export declare const getAssignLawyerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof assignLawyer>>, TError, {
        id: string;
        data: BodyType<AssignLawyerBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof assignLawyer>>, TError, {
    id: string;
    data: BodyType<AssignLawyerBody>;
}, TContext>;
export type AssignLawyerMutationResult = NonNullable<Awaited<ReturnType<typeof assignLawyer>>>;
export type AssignLawyerMutationBody = BodyType<AssignLawyerBody>;
export type AssignLawyerMutationError = ErrorType<unknown>;
/**
 * @summary Assign lawyer to case (admin only)
 */
export declare const useAssignLawyer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof assignLawyer>>, TError, {
        id: string;
        data: BodyType<AssignLawyerBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof assignLawyer>>, TError, {
    id: string;
    data: BodyType<AssignLawyerBody>;
}, TContext>;
/**
 * @summary Get internal notes for a case
 */
export declare const getGetCaseNotesUrl: (id: string) => string;
export declare const getCaseNotes: (id: string, options?: RequestInit) => Promise<CaseNote[]>;
export declare const getGetCaseNotesQueryKey: (id: string) => readonly [`/api/cases/${string}/notes`];
export declare const getGetCaseNotesQueryOptions: <TData = Awaited<ReturnType<typeof getCaseNotes>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseNotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseNotes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseNotesQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseNotes>>>;
export type GetCaseNotesQueryError = ErrorType<unknown>;
/**
 * @summary Get internal notes for a case
 */
export declare function useGetCaseNotes<TData = Awaited<ReturnType<typeof getCaseNotes>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseNotes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add internal note to case
 */
export declare const getAddCaseNoteUrl: (id: string) => string;
export declare const addCaseNote: (id: string, createNoteBody: CreateNoteBody, options?: RequestInit) => Promise<CaseNote>;
export declare const getAddCaseNoteMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addCaseNote>>, TError, {
        id: string;
        data: BodyType<CreateNoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addCaseNote>>, TError, {
    id: string;
    data: BodyType<CreateNoteBody>;
}, TContext>;
export type AddCaseNoteMutationResult = NonNullable<Awaited<ReturnType<typeof addCaseNote>>>;
export type AddCaseNoteMutationBody = BodyType<CreateNoteBody>;
export type AddCaseNoteMutationError = ErrorType<unknown>;
/**
 * @summary Add internal note to case
 */
export declare const useAddCaseNote: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addCaseNote>>, TError, {
        id: string;
        data: BodyType<CreateNoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addCaseNote>>, TError, {
    id: string;
    data: BodyType<CreateNoteBody>;
}, TContext>;
/**
 * @summary Get timeline for a case
 */
export declare const getGetCaseTimelineUrl: (id: string) => string;
export declare const getCaseTimeline: (id: string, options?: RequestInit) => Promise<TimelineEntry[]>;
export declare const getGetCaseTimelineQueryKey: (id: string) => readonly [`/api/cases/${string}/timeline`];
export declare const getGetCaseTimelineQueryOptions: <TData = Awaited<ReturnType<typeof getCaseTimeline>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseTimeline>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseTimeline>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseTimelineQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseTimeline>>>;
export type GetCaseTimelineQueryError = ErrorType<unknown>;
/**
 * @summary Get timeline for a case
 */
export declare function useGetCaseTimeline<TData = Awaited<ReturnType<typeof getCaseTimeline>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseTimeline>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List files for a case
 */
export declare const getGetCaseFilesUrl: (id: string) => string;
export declare const getCaseFiles: (id: string, options?: RequestInit) => Promise<CaseFile[]>;
export declare const getGetCaseFilesQueryKey: (id: string) => readonly [`/api/cases/${string}/files`];
export declare const getGetCaseFilesQueryOptions: <TData = Awaited<ReturnType<typeof getCaseFiles>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseFiles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseFilesQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseFiles>>>;
export type GetCaseFilesQueryError = ErrorType<unknown>;
/**
 * @summary List files for a case
 */
export declare function useGetCaseFiles<TData = Awaited<ReturnType<typeof getCaseFiles>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Upload file to case
 */
export declare const getUploadCaseFileUrl: (id: string) => string;
export declare const uploadCaseFile: (id: string, uploadCaseFileBody: UploadCaseFileBody, options?: RequestInit) => Promise<CaseFile>;
export declare const getUploadCaseFileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadCaseFile>>, TError, {
        id: string;
        data: BodyType<UploadCaseFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadCaseFile>>, TError, {
    id: string;
    data: BodyType<UploadCaseFileBody>;
}, TContext>;
export type UploadCaseFileMutationResult = NonNullable<Awaited<ReturnType<typeof uploadCaseFile>>>;
export type UploadCaseFileMutationBody = BodyType<UploadCaseFileBody>;
export type UploadCaseFileMutationError = ErrorType<unknown>;
/**
 * @summary Upload file to case
 */
export declare const useUploadCaseFile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadCaseFile>>, TError, {
        id: string;
        data: BodyType<UploadCaseFileBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadCaseFile>>, TError, {
    id: string;
    data: BodyType<UploadCaseFileBody>;
}, TContext>;
/**
 * @summary Delete a file
 */
export declare const getDeleteFileUrl: (id: string) => string;
export declare const deleteFile: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteFileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFile>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteFile>>, TError, {
    id: string;
}, TContext>;
export type DeleteFileMutationResult = NonNullable<Awaited<ReturnType<typeof deleteFile>>>;
export type DeleteFileMutationError = ErrorType<unknown>;
/**
 * @summary Delete a file
 */
export declare const useDeleteFile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteFile>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteFile>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Get messages for a case
 */
export declare const getGetCaseMessagesUrl: (id: string) => string;
export declare const getCaseMessages: (id: string, options?: RequestInit) => Promise<Message[]>;
export declare const getGetCaseMessagesQueryKey: (id: string) => readonly [`/api/cases/${string}/messages`];
export declare const getGetCaseMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getCaseMessages>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseMessages>>>;
export type GetCaseMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages for a case
 */
export declare function useGetCaseMessages<TData = Awaited<ReturnType<typeof getCaseMessages>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send message on a case
 */
export declare const getSendMessageUrl: (id: string) => string;
export declare const sendMessage: (id: string, createMessageBody: CreateMessageBody, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: string;
        data: BodyType<CreateMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: string;
    data: BodyType<CreateMessageBody>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<CreateMessageBody>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send message on a case
 */
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: string;
        data: BodyType<CreateMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: string;
    data: BodyType<CreateMessageBody>;
}, TContext>;
/**
 * @summary Get hearings for a case
 */
export declare const getGetCaseHearingsUrl: (id: string) => string;
export declare const getCaseHearings: (id: string, options?: RequestInit) => Promise<Hearing[]>;
export declare const getGetCaseHearingsQueryKey: (id: string) => readonly [`/api/cases/${string}/hearings`];
export declare const getGetCaseHearingsQueryOptions: <TData = Awaited<ReturnType<typeof getCaseHearings>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseHearings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCaseHearings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCaseHearingsQueryResult = NonNullable<Awaited<ReturnType<typeof getCaseHearings>>>;
export type GetCaseHearingsQueryError = ErrorType<unknown>;
/**
 * @summary Get hearings for a case
 */
export declare function useGetCaseHearings<TData = Awaited<ReturnType<typeof getCaseHearings>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCaseHearings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Schedule a hearing
 */
export declare const getScheduleHearingUrl: (id: string) => string;
export declare const scheduleHearing: (id: string, createHearingBody: CreateHearingBody, options?: RequestInit) => Promise<Hearing>;
export declare const getScheduleHearingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof scheduleHearing>>, TError, {
        id: string;
        data: BodyType<CreateHearingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof scheduleHearing>>, TError, {
    id: string;
    data: BodyType<CreateHearingBody>;
}, TContext>;
export type ScheduleHearingMutationResult = NonNullable<Awaited<ReturnType<typeof scheduleHearing>>>;
export type ScheduleHearingMutationBody = BodyType<CreateHearingBody>;
export type ScheduleHearingMutationError = ErrorType<unknown>;
/**
 * @summary Schedule a hearing
 */
export declare const useScheduleHearing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof scheduleHearing>>, TError, {
        id: string;
        data: BodyType<CreateHearingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof scheduleHearing>>, TError, {
    id: string;
    data: BodyType<CreateHearingBody>;
}, TContext>;
/**
 * @summary Update a hearing
 */
export declare const getUpdateHearingUrl: (id: string) => string;
export declare const updateHearing: (id: string, updateHearingBody: UpdateHearingBody, options?: RequestInit) => Promise<Hearing>;
export declare const getUpdateHearingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHearing>>, TError, {
        id: string;
        data: BodyType<UpdateHearingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateHearing>>, TError, {
    id: string;
    data: BodyType<UpdateHearingBody>;
}, TContext>;
export type UpdateHearingMutationResult = NonNullable<Awaited<ReturnType<typeof updateHearing>>>;
export type UpdateHearingMutationBody = BodyType<UpdateHearingBody>;
export type UpdateHearingMutationError = ErrorType<unknown>;
/**
 * @summary Update a hearing
 */
export declare const useUpdateHearing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateHearing>>, TError, {
        id: string;
        data: BodyType<UpdateHearingBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateHearing>>, TError, {
    id: string;
    data: BodyType<UpdateHearingBody>;
}, TContext>;
/**
 * @summary Delete a hearing
 */
export declare const getDeleteHearingUrl: (id: string) => string;
export declare const deleteHearing: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteHearingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHearing>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteHearing>>, TError, {
    id: string;
}, TContext>;
export type DeleteHearingMutationResult = NonNullable<Awaited<ReturnType<typeof deleteHearing>>>;
export type DeleteHearingMutationError = ErrorType<unknown>;
/**
 * @summary Delete a hearing
 */
export declare const useDeleteHearing: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteHearing>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteHearing>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Get dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get recent activity feed
 */
export declare const getGetRecentActivityUrl: (params?: GetRecentActivityParams) => string;
export declare const getRecentActivity: (params?: GetRecentActivityParams, options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: (params?: GetRecentActivityParams) => readonly ["/api/dashboard/recent-activity", ...GetRecentActivityParams[]];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent activity feed
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get cases for current user
 */
export declare const getGetMyCasesUrl: () => string;
export declare const getMyCases: (options?: RequestInit) => Promise<CaseListResponse>;
export declare const getGetMyCasesQueryKey: () => readonly ["/api/dashboard/my-cases"];
export declare const getGetMyCasesQueryOptions: <TData = Awaited<ReturnType<typeof getMyCases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyCases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyCasesQueryResult = NonNullable<Awaited<ReturnType<typeof getMyCases>>>;
export type GetMyCasesQueryError = ErrorType<unknown>;
/**
 * @summary Get cases for current user
 */
export declare function useGetMyCases<TData = Awaited<ReturnType<typeof getMyCases>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get upcoming hearings
 */
export declare const getGetUpcomingHearingsUrl: (params?: GetUpcomingHearingsParams) => string;
export declare const getUpcomingHearings: (params?: GetUpcomingHearingsParams, options?: RequestInit) => Promise<HearingWithCase[]>;
export declare const getGetUpcomingHearingsQueryKey: (params?: GetUpcomingHearingsParams) => readonly ["/api/dashboard/upcoming-hearings", ...GetUpcomingHearingsParams[]];
export declare const getGetUpcomingHearingsQueryOptions: <TData = Awaited<ReturnType<typeof getUpcomingHearings>>, TError = ErrorType<unknown>>(params?: GetUpcomingHearingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpcomingHearings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUpcomingHearings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUpcomingHearingsQueryResult = NonNullable<Awaited<ReturnType<typeof getUpcomingHearings>>>;
export type GetUpcomingHearingsQueryError = ErrorType<unknown>;
/**
 * @summary Get upcoming hearings
 */
export declare function useGetUpcomingHearings<TData = Awaited<ReturnType<typeof getUpcomingHearings>>, TError = ErrorType<unknown>>(params?: GetUpcomingHearingsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUpcomingHearings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List audit logs (admin only)
 */
export declare const getListAuditLogsUrl: (params?: ListAuditLogsParams) => string;
export declare const listAuditLogs: (params?: ListAuditLogsParams, options?: RequestInit) => Promise<AuditLogListResponse>;
export declare const getListAuditLogsQueryKey: (params?: ListAuditLogsParams) => readonly ["/api/audit-logs", ...ListAuditLogsParams[]];
export declare const getListAuditLogsQueryOptions: <TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAuditLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listAuditLogs>>>;
export type ListAuditLogsQueryError = ErrorType<unknown>;
/**
 * @summary List audit logs (admin only)
 */
export declare function useListAuditLogs<TData = Awaited<ReturnType<typeof listAuditLogs>>, TError = ErrorType<unknown>>(params?: ListAuditLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAuditLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map